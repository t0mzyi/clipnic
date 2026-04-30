import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { SettingsService } from '../services/SettingsService';
import { supabase } from '../config/supabase';
import { getBaseUrl, getFrontendUrl } from '../utils/url';

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const STATE_SECRET = process.env.STATE_SECRET || 'clipnic-secure-state-secret-2024';

function signState(data: any): string {
    const state = JSON.stringify(data);
    const signature = crypto.createHmac('sha256', STATE_SECRET).update(state).digest('hex');
    return Buffer.from(JSON.stringify({ state, signature })).toString('base64');
}

function verifyState(encodedState: string): any {
    try {
        const { state, signature } = JSON.parse(Buffer.from(encodedState, 'base64').toString());
        const expectedSignature = crypto.createHmac('sha256', STATE_SECRET).update(state).digest('hex');
        if (signature !== expectedSignature) return null;
        return JSON.parse(state);
    } catch (e) {
        return null;
    }
}

export class AuthController {
  /**
   * Syncs the current session's user with the database.
   */
  static async sync(req: any, res: Response, next: NextFunction) {
    try {
      const { id, email, name, avatarUrl, role } = req.user;
      const user = await AuthService.syncUser(id, email, name, avatarUrl, role);
      
      const settings = await SettingsService.getAllSettings();
      res.json({ success: true, data: user, settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiates Google OAuth for Login (Replaces Supabase URL)
   */
  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const baseUrl = getBaseUrl();
      const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI || `${baseUrl}/api/auth/login/google/callback`;
      
      if (!clientId) {
        return res.status(500).json({ success: false, error: 'Google Client ID is missing.' });
      }

      const client = new OAuth2Client(clientId);
      const state = signState({ timestamp: Date.now() });

      const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        state,
        redirect_uri: redirectUri
      });

      res.json({ success: true, url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Callback for Google Login
   */
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query;
      const frontendUrl = getFrontendUrl();
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const baseUrl = getBaseUrl();
      const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI || `${baseUrl}/api/auth/login/google/callback`;

      if (!code || !state || !clientId || !clientSecret) {
        return res.redirect(`${frontendUrl}/login?error=missing_params`);
      }

      const parsedState = verifyState(state as string);
      if (!parsedState) {
        return res.redirect(`${frontendUrl}/login?error=invalid_state`);
      }

      const client = new OAuth2Client(clientId, clientSecret, redirectUri);
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: clientId,
      });
      
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.redirect(`${frontendUrl}/login?error=invalid_payload`);
      }

      // Find or create user in public.users
      // We use the Google 'sub' (subject ID) as the ID if it's a new user, 
      // or try to match by email to link existing Supabase users.
      
      const { email, sub: googleId, name, picture } = payload;

      // 1. Check if user exists by email (to link with existing Supabase account)
      const { data: existingUser } = await AuthService.findUserByEmail(email);
      
      let targetId = '';
      if (existingUser) {
        targetId = existingUser.id;
      } else {
        // Create new user in Supabase Auth via Admin API to get a valid UUID
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email!,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            avatar_url: picture,
            provider: 'google',
            external_id: googleId
          }
        });

        if (createError) {
          console.error('[GoogleLogin] Supabase user creation error:', createError);
          return res.redirect(`${frontendUrl}/login?error=account_creation_failed`);
        }
        targetId = newUser.user.id;
      }

      // 2. Sync/Create user record in public.users
      const user = await AuthService.syncUser(
        targetId,
        email!,
        name,
        picture,
        existingUser?.role || 'user'
      );

      // 3. Generate our own JWT
      const token = jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role
      }, JWT_SECRET, { expiresIn: '7d' });

      // 4. Redirect to frontend with token
      return res.redirect(`${frontendUrl}/login?token=${token}`);
    } catch (error) {
      console.error('[GoogleLoginCallback] Error:', error);
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }

  /**
   * Initiates Discord OAuth for Login
   */
  static async discordAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = process.env.DISCORD_CLIENT_ID;
      const baseUrl = getBaseUrl();
      const redirectUri = process.env.DISCORD_LOGIN_REDIRECT_URI || `${baseUrl}/api/auth/login/discord/callback`;

      if (!clientId) {
        return res.status(500).json({ success: false, error: 'Discord Client ID is missing.' });
      }

      const state = signState({ timestamp: Date.now() });
      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email&state=${state}`;

      res.json({ success: true, url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Callback for Discord Login
   */
  static async discordCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query;
      const frontendUrl = getFrontendUrl();
      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const baseUrl = getBaseUrl();
      const redirectUri = process.env.DISCORD_LOGIN_REDIRECT_URI || `${baseUrl}/api/auth/login/discord/callback`;

      if (!code || !state || !clientId || !clientSecret) {
        return res.redirect(`${frontendUrl}/login?error=missing_params`);
      }

      const parsedState = verifyState(state as string);
      if (!parsedState) {
        return res.redirect(`${frontendUrl}/login?error=invalid_state`);
      }

      // 1. Exchange code for token
      const tokenUrl = process.env.DISCORD_PROXY_URL 
        ? `${process.env.DISCORD_PROXY_URL}?url=${encodeURIComponent('https://discord.com/api/v10/oauth2/token')}`
        : 'https://discord.com/api/v10/oauth2/token';

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        }).toString()
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error('Discord Token Exchange Error:', tokenRes.status, errorText);
        let errorMsg = 'token_exchange_failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error_description || errorJson.error || 'token_exchange_failed';
        } catch (e) {}
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch User Info
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userRes.ok) {
        return res.redirect(`${frontendUrl}/login?error=user_fetch_failed`);
      }

      const userData = await userRes.json();
      const { email, id: discordId, username, global_name, avatar } = userData;

      if (!email) {
        return res.redirect(`${frontendUrl}/login?error=email_not_provided_by_discord`);
      }

      // 3. Link or Create User
      const { data: existingUser } = await AuthService.findUserByEmail(email);
      let targetId = '';

      if (existingUser) {
        targetId = existingUser.id;
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: {
            full_name: global_name || username,
            avatar_url: avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null,
            provider: 'discord',
            external_id: discordId
          }
        });

        if (createError) {
          console.error('[DiscordLogin] Supabase creation error:', createError);
          return res.redirect(`${frontendUrl}/login?error=account_creation_failed`);
        }
        targetId = newUser.user.id;
      }

      // 4. Sync public record
      const user = await AuthService.syncUser(
        targetId,
        email,
        global_name || username,
        avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : undefined,
        existingUser?.role || 'user'
      );

      // 5. Generate JWT
      const token = jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role
      }, JWT_SECRET, { expiresIn: '7d' });

      return res.redirect(`${frontendUrl}/login?token=${token}`);
    } catch (error) {
      console.error('[DiscordLoginCallback] Error:', error);
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }

  /**
   * Handles Brand Login using email and password
   */
  static async brandLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      // Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (!data.user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      // Sync user and retrieve public user profile
      const user = await AuthService.syncUser(
        data.user.id, 
        data.user.email!, 
        data.user.user_metadata?.full_name || 'Brand User', 
        undefined, 
        data.user.user_metadata?.role || 'brand'
      );
      
      if (user.role !== 'brand' && user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied: not a brand account' });
      }

      const token = jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, token, user });
    } catch (error) {
      console.error('[BrandLogin] Error:', error);
      next(error);
    }
  }
}
