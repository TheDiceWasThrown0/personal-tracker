import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch existing subscriptions
        const { data: existingData } = await supabase
            .from("user_data")
            .select("value")
            .eq("key", "push_subscriptions")
            .single();

        let subscriptions: any[] = [];
        if (existingData && Array.isArray(existingData.value)) {
            subscriptions = existingData.value;
        } else if (existingData && existingData.value) {
            // Migrate old single subscription to array format
            subscriptions = [existingData.value];
        }

        // Check if this endpoint is already subscribed to avoid duplicates
        const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!exists) {
            subscriptions.push(subscription);
        }

        // Store the array of subscriptions in the DB under a new/migrated key
        const { error } = await supabase.from("user_data").upsert({
            key: "push_subscriptions",
            value: subscriptions,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
