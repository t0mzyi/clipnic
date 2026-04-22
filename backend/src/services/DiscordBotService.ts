export class DiscordBotService {
  private static get BOT_TOKEN() { return process.env.DISCORD_BOT_TOKEN; }
  private static readonly API_BASE = 'https://discord.com/api/v10';

  /**
   * Sends a Direct Message to a Discord user.
   */
  static async sendDM(discordId: string, message: string, embed?: any) {
    if (!this.BOT_TOKEN) {
      console.warn('[DiscordBotService] Missing DISCORD_BOT_TOKEN. DM skipped.');
      return;
    }

    try {
      // Step 1: Create or Get DM Channel
      const channelRes = await fetch(`${this.API_BASE}/users/@me/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient_id: discordId })
      });

      if (!channelRes.ok) {
        throw new Error(`Failed to create DM channel: ${await channelRes.text()}`);
      }

      const channel = await channelRes.json();
      const channelId = channel.id;

      return await this.sendMessage(channelId, message, embed);
    } catch (error) {
      console.error(`[DiscordBotService] Error DMing user ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Sends a message to a specific Discord channel.
   */
  static async sendMessage(channelId: string, content: string, embed?: any) {
    if (!this.BOT_TOKEN) return;

    const res = await fetch(`${this.API_BASE}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${this.BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        embeds: embed ? [embed] : []
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to send message: ${await res.text()}`);
    }

    return await res.json();
  }

  /**
   * Creates a Category channel in a guild.
   */
  static async createCategory(guildId: string, name: string) {
    if (!this.BOT_TOKEN) return;

    const res = await fetch(`${this.API_BASE}/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${this.BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        type: 4 // GUILD_CATEGORY
      })
    });

    if (!res.ok) {
        throw new Error(`Failed to create category: ${await res.text()}`);
    }

    return await res.json();
  }

  /**
   * Creates a private text channel under a category for a specific user.
   */
  static async createPrivateChannel(guildId: string, categoryId: string, discordUserId: string, channelName: string) {
    if (!this.BOT_TOKEN) return;

    const botId = process.env.DISCORD_CLIENT_ID;

    const res = await fetch(`${this.API_BASE}/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${this.BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: channelName,
        type: 0, // GUILD_TEXT
        parent_id: categoryId,
        permission_overwrites: [
          {
            id: guildId, // @everyone role ID is the guild ID
            type: 0,
            allow: "0",
            deny: "1024" // VIEW_CHANNEL
          },
          {
            id: discordUserId,
            type: 1,
            allow: "3072", // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
            deny: "0"
          },
          ...(botId ? [{
            id: botId,
            type: 1,
            allow: "3072", // Ensure bot can see and talk in its own channel
            deny: "0"
          }] : [])
        ]
      })
    });

    if (!res.ok) {
        throw new Error(`Failed to create private channel: ${await res.text()}`);
    }

    return await res.json();
  }
}
