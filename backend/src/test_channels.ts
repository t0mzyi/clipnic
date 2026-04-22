import dotenv from 'dotenv';
import { DiscordBotService } from './services/DiscordBotService';

dotenv.config();

async function testPrivateChannels() {
  const guildId = process.env.DISCORD_GUILD_ID;
  const adminId = process.env.DISCORD_ADMIN_ID; // We use this for the "user" in the private channel
  
  if (!guildId || !adminId) {
    console.error('❌ Missing DISCORD_GUILD_ID or DISCORD_ADMIN_ID in environment.');
    return;
  }

  const campaignTitle = "Trial Mission Alpha";

  try {
    console.log(`🚀 Creating Trial Category: "Completed: ${campaignTitle}"...`);
    const category = await DiscordBotService.createCategory(guildId, `Completed: ${campaignTitle}`);
    const categoryId = category.id;
    console.log(`✅ Category created: ${categoryId}`);

    console.log(`🚀 Creating Private Channel for Admin in Category...`);
    const channel = await DiscordBotService.createPrivateChannel(guildId, categoryId, adminId, 'trial-claim-jaideep');
    const channelId = channel.id;
    console.log(`✅ Private Channel created: ${channelId}`);

    const claimAmount = "125.00";
    const message = `Hello <@${adminId}>, you have a claimable balance of **$${claimAmount}** from participating in **${campaignTitle}**.\n\nPlease provide your account details (Bank/Wallet) here so we can process your payout. 🏦`;
    
    console.log(`🚀 Sending claim request message to private channel...`);
    await DiscordBotService.sendMessage(channelId, message);
    console.log(`✅ Message sent and user mentioned!`);

    console.log(`\n✨ Trial Channel Flow completed successfully! Check your Discord guild.`);
  } catch (error) {
    console.error('❌ Trial failed:', error);
  }
}

testPrivateChannels();
