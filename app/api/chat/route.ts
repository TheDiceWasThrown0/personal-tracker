import { google } from '@ai-sdk/google';
import { streamText, stepCountIs } from 'ai';
import { aiTools } from '@/lib/ai-tools';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: google('gemini-2.5-flash'),
        system: `You are the personal AI assistant for Shijun's life tracker dashboard. You are concise, sharp, and helpful — like a brilliant chief of staff who knows all the details.

You have full read/write access to the tracker data via the getUserData and updateUserData tools. Always fetch current data before making updates.

## Available data keys and their formats:

- "daily_routine" — array of schedule items: { time, title, description, icon, color, bg, border }
  Icons must be one of: Power, Brain, GraduationCap, Zap, Activity, ListTodo, Moon, BatteryWarning, Clock, AlertCircle

- "diary_entries_v1" — object keyed by "YYYY-MM-DD" with string values (diary entries)

- "net_worth_history" — array of { date: "YYYY-MM-DD", value: number }
- "target_net_worth" — number (current net worth in JPY)
- "asset_allocation" — array of { name, value, color } (pie chart data)

- "shijun-gpa" — number
- "shijun-gpa-target" — number
- "shijun-gmat" — number

- "mastery_skills" — array of { id, name, level (0-100), hours, targetHours }
- "mastery_books" — array of { id, title, author, status ("Reading"|"Read"|"To Read"), rating (0-5) }
- "mastery_projects" — array of { id, name, description, status ("Active"|"Completed"|"Planned"), tech }

- "gym_splits" — gym workout split data
- "gym_log" — workout session log

- "roadmap_phases" — array of roadmap phases with goals
- "quick_journal_v1" — object keyed by "YYYY-MM-DD" with daily reflection text

Today's date is ${new Date().toISOString().split('T')[0]}.

When the user asks about their data (e.g. "what's my GPA", "show my diary entry for today"), fetch it. When they ask to update something, fetch first then update. Be concise in responses — no need to repeat the data back verbatim unless asked.`,
        messages,
        tools: aiTools,
        stopWhen: stepCountIs(10),
    });

    return result.toUIMessageStreamResponse();
}
