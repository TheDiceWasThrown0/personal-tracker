import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local manually since we are running a script
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Testing connection to:", url)
console.log("Key length:", key?.length)
console.log("Key prefix:", key?.substring(0, 15))

if (!url || !key) {
    console.error("Missing credentials!")
    process.exit(1)
}

const supabase = createClient(url, key)

async function test() {
    try {
        // Try to fetch data from a non-existent table just to check auth/connection
        // Or better, checking health or just a simple query
        // Since we haven't created tables yet, this might fail on table not found, 
        // but if Auth is wrong, it will fail on 401.

        const { data, error } = await supabase.from('user_data').select('count', { count: 'exact', head: true })

        if (error) {
            console.error("Supabase Error:", error.message, error.code, error.details, error.hint)
            // If code is "PGRST301" (JWK) or similar auth error
        } else {
            console.log("Connection successful! (Table might be missing but Auth worked)")
        }
    } catch (e) {
        console.error("Exception:", e)
    }
}

test()
