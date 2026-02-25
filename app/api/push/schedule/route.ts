import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const schedules = await req.json();

        if (!Array.isArray(schedules)) {
            return NextResponse.json({ error: "Invalid schedule format" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Store the schedule
        const { error } = await supabase.from("user_data").upsert({
            key: "notification_schedules",
            value: schedules,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Failed to save schedules" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving schedule:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
