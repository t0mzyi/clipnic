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

      if (!clientId || !clientSecret || !redirectUri) {
        console.error('Missing Discord credentials:', { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri: !!redirectUri });
        return res.redirect(`${frontendUrl}/profile?discord_error=${encodeURIComponent('Backend is missing DISCORD_CLIENT_ID or SECRET')}`);
      }

      // 1. Exchange code for access token
      const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        }).toString()
      });

      if (!tokenRes.ok) {
        let errStr = 'token_exchange_failed';
        try {
            const errorText = await tokenRes.text();
            console.error('Discord Token Error Raw:', errorText);
            try {
                const errJson = JSON.parse(errorText);
                if (errJson.error_description) {
                    errStr = encodeURIComponent(errJson.error_description);
                } else if (errJson.error) {
                    errStr = encodeURIComponent(errJson.error);
                }
            } catch (jsonErr) {
                errStr = encodeURIComponent(errorText.slice(0, 100));
            }
        } catch (e) {
            console.error('Failed to read Discord error body:', e);
        }
        return res.redirect(`${frontendUrl}/profile?discord_error=${errStr}`);
      }

      const tokenData = await tokenRes.json();
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
        const errText = await userGuildsRes.text();
        console.error(`Failed to fetch user guilds: ${userGuildsRes.status} - ${errText}`);
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
  static async verifyYoutube(req: any, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.user;
      let { handle, code } = req.body;

      if (!handle || !code) {
        return res.status(400).json({ success: false, error: 'YouTube handle and verification code are required.' });
      }

      // Cleanup handle
      handle = handle.trim();
      if (!handle.startsWith('@')) handle = '@' + handle;

      // Fetch the raw HTML of the YouTube channel
      // Fetching the main page is more reliable than /about
      const ytUrl = `https://www.youtube.com/${handle}`;
      console.log(`Verifying YouTube at: ${ytUrl} for code: ${code}`);

      const ytResponse = await fetch(ytUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!ytResponse.ok) {
        console.error(`YouTube Fetch Failed: ${ytResponse.status} ${ytResponse.statusText}`);
        return res.status(404).json({ success: false, error: `YouTube channel not found. Make sure the handle ${handle} is correct.` });
      }

      const html = await ytResponse.text();
      
      // search case-insensitively just in case user mistyped case
      const found = html.toLowerCase().includes(code.toLowerCase());

      if (!found) {
        console.warn(`Code ${code} NOT found in HTML for ${handle}`);
        return res.status(400).json({ 
          success: false, 
          error: `Could not find code ${code} on your channel description. Note: YouTube often takes 2-3 minutes to update their public page. Try again in a moment!` 
        });
      }

      console.log(`Successfully verified YouTube handle: ${handle}`);

      // Verification successful
      const { error } = await supabase
        .from('users')
        .update({ youtube_verified: true, youtube_handle: handle })
        .eq('id', userId);

      if (error) {
        console.error('Supabase youtube verify error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update database after verification.' });
      }

      res.json({ success: true, message: 'YouTube channel verified successfully!' });
    } catch (error) {
      console.error('YouTube verification error:', error);
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
