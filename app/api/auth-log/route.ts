import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend only if key exists to prevent build failures
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
    if (!resend) {
        console.warn("RESEND_API_KEY is missing. Email not sent.");
        return NextResponse.json({ error: "Email service not configured" }, { status: 200 }); // Return 200 to not break the app
    }
    try {
        const { timestamp, userAgent } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'System <onboarding@resend.dev>', // Default Resend testing domain
            to: ['shijunzhou0711@gmail.com'], // User's email
            subject: 'Login Alert: Shijun\'s Room Accessed',
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>🔐 Access Granted</h2>
          <p>Someone just unlocked the dashboard.</p>
          <hr />
          <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <p><strong>Device:</strong> ${userAgent}</p>
          <p><strong>Status:</strong> <span style="color: green;">Success (Code 2041)</span></p>
          <hr />
          <p style="font-size: 12px; color: #666;">If this was you, carry on. If not, check your security.</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
