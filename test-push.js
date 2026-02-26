require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function test() {
    const { data, error } = await supabase.from("user_data").select("value").eq("key", "push_subscriptions").single();
    if (error || !data) {
        console.error("No subscriptions found:", error);
        return;
    }
    
    let subs = Array.isArray(data.value) ? data.value : [data.value];
    console.log(`Found ${subs.length} subscriptions. Sending test payload...`);
    
    const payload = JSON.stringify({ title: 'Diagnostic Test', body: 'System check' });
    
    for (const sub of subs) {
        try {
            console.log(`Sending to: ${sub.endpoint.substring(0, 50)}...`);
            await webpush.sendNotification(sub, payload);
            console.log("SUCCESS");
        } catch (e) {
            console.error("ERROR:");
            console.error(e.statusCode, e.message, e.body);
        }
    }
}
test();
