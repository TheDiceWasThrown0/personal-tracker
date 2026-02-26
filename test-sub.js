const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from("user_data")
        .select("value")
        .eq("key", "push_subscriptions")
        .single();
        
    if (error) {
        console.error("Error fetching:", error.message);
    } else {
        console.log("Subscriptions Data:");
        console.dir(data.value, { depth: null });
    }
}
main();
