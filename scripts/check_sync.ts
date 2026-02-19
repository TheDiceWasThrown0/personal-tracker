import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(url!, key!)

async function checkData() {
    console.log("Checking Supabase 'user_data' table...")
    const { data, error } = await supabase.from('user_data').select('*')

    if (error) {
        console.error("Error fetching data:", error)
    } else {
        console.log(`Found ${data.length} records in user_data.`)
        data.forEach(row => {
            console.log(`- ${row.key}: ${JSON.stringify(row.value).substring(0, 50)}...`)
        })
    }
}

checkData()
