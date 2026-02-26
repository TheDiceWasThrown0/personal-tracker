import { tool } from 'ai';
import { z } from 'zod';
import { supabase } from './supabaseClient';

export const aiTools = {
    getUserData: tool({
        description: 'Read data from the user_data table by key. Use this to fetch the current state of the Tracker (e.g., mastery_skills, daily_routine, net_worth_history).',
        inputSchema: z.object({
            key: z.string().describe('The key of the data to fetch.'),
        }),
        execute: async ({ key }: { key: string }) => {
            try {
                const { data, error } = await supabase
                    .from('user_data')
                    .select('value')
                    .eq('key', key)
                    .single();

                if (error) {
                    return { success: false, error: error.message };
                }

                return { success: true, value: data?.value };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    }),
    updateUserData: tool({
        description: 'Update data in the user_data table by key. Use this to modify the state of the Tracker (e.g., checking off a routine, adding a skill).',
        inputSchema: z.object({
            key: z.string().describe('The key of the data to update.'),
            value: z.any().describe('The completely new value to set for this key. This will overwrite the existing payload, so make sure to fetch the current state first and merge the changes if necessary.'),
        }),
        execute: async ({ key, value }: { key: string; value: any }) => {
            try {
                const { error } = await supabase
                    .from('user_data')
                    .upsert({
                        key,
                        value,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'key' });

                if (error) {
                    return { success: false, error: error.message };
                }

                return { success: true, message: `Successfully updated ${key}.` };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    }),
};
