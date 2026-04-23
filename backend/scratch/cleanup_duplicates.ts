import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log('Checking for duplicates...');
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, url');

  if (error) {
    console.error('Error fetching submissions:', error);
    return;
  }

  const urlMap: Record<string, string[]> = {};
  for (const sub of submissions) {
    if (!urlMap[sub.url]) urlMap[sub.url] = [];
    urlMap[sub.url].push(sub.id);
  }

  const duplicates = Object.entries(urlMap).filter(([url, ids]) => ids.length > 1);

  if (duplicates.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate URLs.`);

  for (const [url, ids] of duplicates) {
    console.log(`URL: ${url} (IDs: ${ids.join(', ')})`);
    // Keep the first one, delete others
    const toDelete = ids.slice(1);
    console.log(`Deleting duplicates: ${toDelete.join(', ')}`);
    
    const { error: delErr } = await supabase
      .from('submissions')
      .delete()
      .in('id', toDelete);
    
    if (delErr) {
      console.error(`Failed to delete duplicates for ${url}:`, delErr);
    }
  }

  console.log('Duplicate cleanup complete!');
}

run();
