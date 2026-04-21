import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export class VerificationController {
  /**
   * Generates the Discord OAuth2 authorization URL and redirects the user.
   */
  static async discordAuth(req: any, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.user; // From authenticate middleware
      const clientId = process.env.DISCORD_CLIENT_ID;
      const redirectUri = process.env.DISCORD_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        return res.status(500).json({ success: false, error: 'Discord OAuth credentials missing in backend.' });
      }

      const state = encodeURIComponent(userId);
      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds&state=${state}`;

      res.json({ success: true, url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the callback from Discord, gets user ID, and checks membership.
   */
  static async discordCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      if (!code || !state) {
        return res.redirect(`${frontendUrl}/profile?discord_error=missing_params`);
      }

      const userId = decodeURIComponent(state as string);
      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = process.env.DISCORD_REDIRECT_URI;

      const tokenUrl = process.env.DISCORD_PROXY_URL 
        ? `${process.env.DISCORD_PROXY_URL}?url=${encodeURIComponent('https://discord.com/api/v10/oauth2/token')}`
        : 'https://discord.com/api/v10/oauth2/token';

      const fetchToken = async (retryCount = 0): Promise<any> => {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: new URLSearchParams({
              client_id: clientId as string,
              client_secret: clientSecret as string,
              grant_type: 'authorization_code',
              code: code as string,
              redirect_uri: redirectUri as string
            }).toString()
          });

          if (response.status === 429 && retryCount < 1) {
              const retryAfter = response.headers.get('Retry-After');
              const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
              if (waitMs <= 5000) { // Only auto-retry if wait is short
                  console.warn(`Discord rate limited. Retrying after ${waitMs}ms...`);
                  await new Promise(r => setTimeout(r, waitMs));
                  return fetchToken(retryCount + 1);
              }
          }
          return response;
      };

      const discordTokenRes = await fetchToken();

      if (discordTokenRes.status === 429) {
        console.warn('Discord rate limited — Render IP is temporarily blocked by Discord.');
        return res.redirect(`${frontendUrl}/profile?discord_error=${encodeURIComponent('Rate limited by Discord. Please wait a few minutes and try again.')}`);
      }

      if (!discordTokenRes.ok) {
        const errorText = await discordTokenRes.text();
        console.error('Discord Token Error:', discordTokenRes.status, errorText);
        let errStr = 'token_exchange_failed';
        try {
            const errJson = JSON.parse(errorText);
            errStr = encodeURIComponent(errJson.error_description || errJson.error || 'token_exchange_failed');
        } catch (e) {
            errStr = encodeURIComponent(errorText.slice(0, 200));
        }
        return res.redirect(`${frontendUrl}/profile?discord_error=${errStr}`);
      }

      const tokenData = await discordTokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch User Info to get Discord ID
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userRes.ok) {
        return res.redirect(`${frontendUrl}/profile?discord_error=user_fetch_failed`);
      }

      const userData = await userRes.json();
      const discordId = userData.id;

      // 3. Check Server Membership using the USER's access token
      const guildId = process.env.DISCORD_GUILD_ID || '1298616616459702282';
      
      const userGuildsRes = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userGuildsRes.ok) {
        return res.redirect(`${frontendUrl}/profile?discord_error=failed_to_fetch_guilds`);
      }

      const guilds = await userGuildsRes.json();
      
      // Check if our server is in the user's list of joined servers
      const isMember = guilds.some((g: any) => g.id === guildId);

      if (!isMember) {
        console.error(`User ${discordId} is not in the required guild ${guildId}`);
        return res.redirect(`${frontendUrl}/profile?discord_error=not_in_server`);
      }

      // 4. Update Database
      const { error } = await supabase
        .from('users')
        .update({ discord_verified: true, discord_id: discordId })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        return res.redirect(`${frontendUrl}/profile?discord_error=db_error`);
      }

      // 5. Success Redirect
      return res.redirect(`${frontendUrl}/profile?discord_success=true`);

    } catch (error: any) {
       console.error('Callback error:', error);
       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
       const msg = error.message ? encodeURIComponent(error.message) : 'server_error';
       return res.redirect(`${frontendUrl}/profile?discord_error=${msg}`);
    }
  }

  /**
   * Verifies if a YouTube channel's bio contains the unique verification code.
   * Expects { handle: string, code: string } in the body.
   */
  /**
   * Redirects user to Google OAuth for YouTube channel linking
   */
  static async youtubeGoogleAuth(req: any, res: Response, next: NextFunction) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      
      if (!clientId || !redirectUri) {
        return res.status(500).json({ success: false, error: 'Google OAuth is not configured on the server.' });
      }

      // Pass user ID within the state parameter to know who is linking
      const state = encodeURIComponent(JSON.stringify({ userId: req.user.id }));
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly')}` +
        `&access_type=offline` +
        `&prompt=select_account` +
        `&state=${state}`;

      res.json({ success: true, url: authUrl });
    } catch (error) {
      console.error('youtubeGoogleAuth error:', error);
      next(error);
    }
  }

  /**
   * Handles the Google OAuth callback, fetches channels.list, and saves to DB.
   */
  static async youtubeGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state, error } = req.query;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      if (error) {
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('Authentication cancelled or failed.')}`);
      }

      if (!code || !state) {
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('Invalid callback parameters.')}`);
      }

      const { userId } = JSON.parse(decodeURIComponent(state as string));

      // 1. Exchange code for token
      const clientId = process.env.GOOGLE_CLIENT_ID!;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenRes.ok) {
        console.error('Failed to exchange Google token:', await tokenRes.text());
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('Failed to exchange token with Google.')}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Query YouTube channels API
      const ytRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!ytRes.ok) {
        console.error('Failed to fetch YouTube channel:', await ytRes.text());
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('Failed to read your YouTube channels.')}`);
      }

      const ytData = await ytRes.json();
      
      if (!ytData.items || ytData.items.length === 0) {
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('No YouTube channel found on this Google account. Please create one first!')}`);
      }

      // 3. Extract channel info
      const channel = ytData.items[0];
      const channelId = channel.id;
      // snippet.customUrl typically contains the "@handle"
      let handle = channel.snippet.customUrl || channel.snippet.title;
      if (!handle.startsWith('@')) handle = '@' + handle; // Safely default

      // 4. Update Database
      const { data: userRaw } = await supabase.from('users').select('youtube_channels').eq('id', userId).single();
      const existingChannels = userRaw?.youtube_channels || [];

      // Don't duplicate
      const channelExists = existingChannels.find((c: any) => c.channelId === channelId);
      if (!channelExists) {
         existingChannels.push({ handle, channelId });
      }

      const { error: dbError } = await supabase
        .from('users')
        .update({ 
            youtube_verified: true, 
            youtube_handle: existingChannels[0].handle, // Legacy prop sync
            youtube_channels: existingChannels 
        })
        .eq('id', userId);

      if (dbError) {
        console.error('Supabase youtube link error:', dbError);
        return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent('Failed to link channel in database.')}`);
      }

      return res.redirect(`${frontendUrl}/profile?youtube_success=true`);

    } catch (error: any) {
      console.error('youtubeGoogleCallback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/profile?youtube_error=${encodeURIComponent(error.message || 'Server error')}`);
    }
  }

  /**
   * MANUAL VERIFICATION (Old method / Fallback)
   * Verifies if a YouTube channel's bio contains the unique verification code via scraping.
   */
  static async verifyYoutube(req: any, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.user;
      let { handle, code } = req.body;

      if (!handle || !code) {
        return res.status(400).json({ success: false, error: 'YouTube handle/URL and verification code are required.' });
      }

      // Cleanup handle
      handle = handle.trim();
      const handleMatch = handle.match(/@([\w.-]+)/);
      if (handleMatch) {
          handle = `@${handleMatch[1]}`;
      } else {
          if (!handle.startsWith('@')) handle = '@' + handle;
      }

      // Fetch the raw HTML of the YouTube channel
      const ytUrl = `https://www.youtube.com/${handle}`;
      const ytResponse = await fetch(ytUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!ytResponse.ok) {
        return res.status(404).json({ success: false, error: `YouTube channel not found at ${handle}.` });
      }

      const html = await ytResponse.text();
      const found = html.toLowerCase().includes(code.toLowerCase());

      if (!found) {
        return res.status(400).json({ 
          success: false, 
          error: `Could not find code ${code} in your channel bio. Note: YouTube may take a few minutes to update public pages.` 
        });
      }

      // Fetch Channel ID via official API to ensure mapping is correct
      let channelId = null;
      if (process.env.YOUTUBE_API_KEY) {
          try {
              const query = handle.startsWith('@') ? handle : `@${handle}`;
              const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`);
              const searchJson = await searchRes.json();
              if (searchJson.items?.length > 0) {
                  channelId = searchJson.items[0].snippet.channelId;
              }
          } catch(e) { console.error("Search API fail:", e); }
      }

      // Update Database
      const { data: userRaw } = await supabase.from('users').select('youtube_channels').eq('id', userId).single();
      const existingChannels = userRaw?.youtube_channels || [];

      if (!existingChannels.find((c: any) => c.handle === handle)) {
          existingChannels.push({ handle, channelId });
      }

      const { error } = await supabase
        .from('users')
        .update({ 
            youtube_verified: true, 
            youtube_handle: handle, 
            youtube_channels: existingChannels 
        })
        .eq('id', userId);

      if (error) throw error;

      res.json({ success: true, message: 'YouTube channel verified successfully via bio scraping!' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disconnects a given YouTube channel from the user's profile.
   * Decrements the youtube_channels array and toggles youtube_verified if empty.
   */
  static async disconnectYoutubeChannel(req: any, res: Response, next: NextFunction) {
      try {
          const { id: userId } = req.user;
          const { channelId } = req.params;

          if (!channelId) {
              return res.status(400).json({ success: false, error: 'Channel ID is required' });
          }

          if (channelId === 'legacy') {
              // Complete reset for legacy or corrupted accounts
              const { error: resetErr } = await supabase
                .from('users')
                .update({
                    youtube_channels: [],
                    youtube_verified: false,
                    youtube_handle: null
                })
                .eq('id', userId);
              
              if (resetErr) throw resetErr;
              return res.json({ success: true, message: 'YouTube connection reset.' });
          }

          // 1. Fetch user's existing youtube channels
          const { data: userRaw, error: fetchErr } = await supabase.from('users').select('youtube_channels, youtube_verified').eq('id', userId).single();
          
          if (fetchErr) throw fetchErr;

          let existingChannels = userRaw?.youtube_channels || [];

          // 2. Filter out the targeted channel
          const updatedChannels = existingChannels.filter((c: any) => c.channelId !== channelId);

          // 3. Fallbacks and status toggles
          const newlyVerifiedState = updatedChannels.length > 0;
          const fallbackHandle = newlyVerifiedState ? updatedChannels[0].handle : null;

          const { error: updateErr } = await supabase
              .from('users')
              .update({
                  youtube_channels: updatedChannels,
                  youtube_verified: newlyVerifiedState,
                  youtube_handle: fallbackHandle
              })
              .eq('id', userId);

          if (updateErr) throw updateErr;

          res.json({ success: true, message: 'YouTube channel disconnected.' });
      } catch (error) {
          console.error('disconnectYoutubeChannel error:', error);
          next(error);
      }
  }

  /**
   * Verifies if a user is in the designated Discord server (Manual ID fallback).
   */
  static async verifyDiscord(req: any, res: Response, next: NextFunction) {
    try {
      const { discordId } = req.body;
      const { id: userId } = req.user; // from our authMiddleware

      if (!discordId) {
        return res.status(400).json({ success: false, error: 'Discord User ID is required.', code: 400 });
      }

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        return res.status(500).json({ success: false, error: 'Discord bot token is not configured.', code: 500 });
      }

      const guildId = '1298616616459702282';
      
      // Make request to Discord API to check member
      const discordRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`
        }
      });

      if (!discordRes.ok) {
        if (discordRes.status === 404) {
          return res.status(400).json({ success: false, error: 'User is not in the server.', code: 400 });
        }
        return res.status(400).json({ success: false, error: 'Failed to verify with Discord. Check the ID.', code: 400 });
      }

      // If we got here, they are in the server. Update the database.
      const { data, error } = await supabase
        .from('users')
        .update({ discord_verified: true, discord_id: discordId })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
