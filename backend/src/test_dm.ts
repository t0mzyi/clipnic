import dotenv from 'dotenv';
import { DiscordBotService } from './services/DiscordBotService';

dotenv.config();

/**
 * Quick script to verify the Discord Bot DM system
 * Sends a signal to the DISCORD_ADMIN_ID from the env.
 */
async function testAdminDM() {
  const adminId = process.env.DISCORD_ADMIN_ID;
  
  if (!adminId) {
    console.error('❌ DISCORD_ADMIN_ID not found in environment.');
    return;
  }

  const campaignTitle = "Example Mission X";

  console.log(`🚀 Sending Trial Success Message to admin: ${adminId}...`);
  const successMsg = `Mission Complete: **${campaignTitle}**\n\nGreat work! The mission has successfully concluded and we've verified your participation. \n\nYour final earnings for this clip come to **$85.50**. We've updated your total claimable balance to **$210.25**.\n\nEverything is finalized and ready for withdrawal whenever you're set. Catch you in the next one! 🚀`;
  const successEmbed = {
      title: "Goal Achieved! 🎯",
      description: `You've earned **$85.50** from the **${campaignTitle}** mission.`,
      color: 0x10b981, // Emerald
      fields: [
          { name: "Total Claimable", value: "$210.25", inline: true }
      ],
      url: `${process.env.FRONTEND_URL}/submissions`
  };

  try {
    await DiscordBotService.sendDM(adminId, successMsg, successEmbed);
    console.log('✅ Success message sent!');
    
    console.log(`🚀 Sending Trial Failure Message to admin: ${adminId}...`);
    const failMsg = `Mission Concluded: **${campaignTitle}**\n\nJust a quick update that the mission has ended. Unfortunately, this submission didn't quite reach the view target this time around. \n\nNo sweat though—we've got new missions dropping soon. Keep an eye on the dashboard for the next opportunity. 📈`;
    const failEmbed = {
        title: "Mission Concluded",
        description: `The mission **${campaignTitle}** has ended. You didn't hit the minimum view requirement this time.`,
        color: 0xef4444, // Red
        url: `${process.env.FRONTEND_URL}/submissions`
    };
    await DiscordBotService.sendDM(adminId, failMsg, failEmbed);
    console.log('✅ Failure message sent!');

    console.log('\n✨ All trial messages sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send trial messages:', error);
  }
}

testAdminDM();
