export class LoggerService {
  /**
   * Sends a formatted embed log to the Discord Webhook.
   * Colors: Info (0x10b981 - Green), Warning (0xf59e0b - Amber), Error (0xef4444 - Red)
   */
  static async sendDiscordLog(title: string, message: string, color: number = 0x10b981, ping: boolean = false) {
    let webhookUrl = process.env.DISCORD_LOG_WEBHOOK_URL;

    // Use audit-specific webhook if title involves security/audit
    if (title.includes('AUDIT') && process.env.DISCORD_AUDIT_WEBHOOK_URL) {
        webhookUrl = process.env.DISCORD_AUDIT_WEBHOOK_URL;
    } else if (title.includes('Payout') && process.env.DISCORD_PAYOUT_WEBHOOK_URL) {
        webhookUrl = process.env.DISCORD_PAYOUT_WEBHOOK_URL;
    }
    
    const adminId = process.env.DISCORD_ADMIN_ID;
    
    // Silence if no webhook
    if (!webhookUrl) return;

    // Construct ping string if requested and ID exists
    const content = (ping && adminId) ? `<@${adminId}>` : undefined;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          embeds: [{
            title: `[CLIPNIC MONITOR] ${title}`,
            description: message,
            color,
            timestamp: new Date().toISOString(),
            footer: { 
              text: `Clipnic Monitoring System · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })} IST` 
            }
          }]
        })
      });
    } catch (err) {
      // Don't crash the app if logging fails
      console.error('Failed to send Discord Log:', err);
    }
  }

  static async info(title: string, message: string) {
    return this.sendDiscordLog(title, message, 0x10b981, false);
  }

  static async warn(title: string, message: string, ping: boolean = true) {
    return this.sendDiscordLog(title, message, 0xf59e0b, ping);
  }

  static async error(title: string, message: string, ping: boolean = true) {
    return this.sendDiscordLog(title, message, 0xef4444, ping);
  }
}
