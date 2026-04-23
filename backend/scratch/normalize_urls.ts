import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const canonicalizeUrl = (url: string, platform: string): string => {
  if (!url) return '';
  let cleanUrl = url.split('?')[0].split('#')[0].trim().replace(/\/$/, '');
  
  if (platform === 'youtube') {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
  } else if (platform === 'instagram') {
      const match = url.match(/(?:\/p\/|\/reels?\/|\/tv\/)([^/?#&]+)/i);
      if (match) return `https://www.instagram.com/reels/${match[1]}/`;
  } else if (platform === 'tiktok') {
      const match = url.match(/\/video\/(\d+)/i) || url.match(/video_id=(\d+)/i) || url.match(/tiktok\.com\/.*\/(\d+)/i);
      if (match) return `https://www.tiktok.com/video/${match[1]}`;
  }
  return cleanUrl.replace(/^http:\/\//i, 'https://');
};

async function run() {
  console.log('Fetching all submissions...');
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, url, platform');

  if (error) {
    console.error('Error fetching submissions:', error);
    return;
  }

  console.log(`Found ${submissions.length} submissions. Starting normalization...`);

  for (const sub of submissions) {
    const canonical = canonicalizeUrl(sub.url, sub.platform);
    if (canonical !== sub.url) {
      console.log(`Updating ${sub.id}: ${sub.url} -> ${canonical}`);
      const { error: updateErr } = await supabase
        .from('submissions')
        .update({ url: canonical })
        .eq('id', sub.id);
      
      if (updateErr) {
        console.error(`Failed to update ${sub.id}:`, updateErr);
      }
    }
  }

  console.log('Normalization complete!');
}

run();
