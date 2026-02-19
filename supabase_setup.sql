-- Create the table for storing simple key-value pairs
create table user_data (
  key text primary key,
  value jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table user_data;

-- (Optional) If you have Row Level Security enabled, you might need policies. 
-- For now, we assume public access or you can disable RLS for this table if it's just for you.
alter table user_data enable row level security;

create policy "Enable all access for now" 
on user_data for all 
using (true) 
with check (true);
