import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// VAPID keys should be generated only once.
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
    "mailto:your-email@example.com", // You can leave this as a placeholder or change it
    publicVapidKey,
    privateVapidKey
);

export async function GET(req: NextRequest) {
    // 1. Authenticate the request (Very Important for Cron jobs!)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.warn("Unauthorized attempt to access cron route.");
        // In local development, you might want to bypass this, but for production it's critical.
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Get the current time (Hours and Minutes)
        // Next.js APIs run in UTC on Vercel. We need to match the timezone the user set.
        // For simplicity, let's assume the schedules are saved as "HH:MM" in UTC, 
        // OR the cron runs every minute and we check if any schedule matches the current time in a specific timezone.

        // Let's use standard JS date to get current UTC hour/minute
        const now = new Date();
        // Use Japan Timezone for standard "local" time if wanted, or store times as UTC.
        // Assuming schedules are saved as "HH:MM" in the Japan timezone (since your system time shows JST).
        const jstString = now.toLocaleTimeString("en-US", { timeZone: "Asia/Tokyo", hour12: false, hour: "2-digit", minute: "2-digit" });

        // 3. Fetch schedules and the push subscription from Supabase
        const { data: scheduleData, error: scheduleError } = await supabase
            .from("user_data")
            .select("value")
            .eq("key", "notification_schedules")
            .single();

        if (scheduleError || !scheduleData) {
            return NextResponse.json({ message: "No schedules found" }, { status: 200 });
        }

        const { data: subData, error: subError } = await supabase
            .from("user_data")
            .select("value")
            .eq("key", "push_subscription")
            .single();

        if (subError || !subData) {
            return NextResponse.json({ message: "No push subscription found" }, { status: 200 });
        }

        const schedules = scheduleData.value as { time: string; message: string; enabled: boolean }[];
        const subscription = subData.value;

        let sentCount = 0;

        // 4. Check if any schedule matches the current time
        for (const schedule of schedules) {
            // Compare "HH:MM"
            if (schedule.enabled && schedule.time === jstString) {
                // 5. Send Notification
                const payload = JSON.stringify({
                    title: "Personal Tracker",
                    body: schedule.message,
                });

                try {
                    await webpush.sendNotification(subscription, payload);
                    sentCount++;
                } catch (pushErr) {
                    console.error("Failed to send push:", pushErr);
                }
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
