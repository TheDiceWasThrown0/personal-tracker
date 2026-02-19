import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useSyncedState<T>(key: string, initialValue: T) {
    // 1. Initialize with default value to match Server Side Rendering
    const [storedValue, setStoredValue] = useState<T>(initialValue)
    const [isHydrated, setIsHydrated] = useState(false)

    // 2. Hydrate from LocalStorage and Supabase on mount
    useEffect(() => {
        // LocalStorage hydration (fast)
        try {
            if (typeof window !== "undefined") {
                const item = window.localStorage.getItem(key)
                if (item) {
                    setStoredValue(JSON.parse(item))
                }
            }
        } catch (error) {
            console.log("Error reading localStorage:", error)
        }
        setIsHydrated(true) // Local hydration done

        // Supabase hydration and Realtime (async)
        const fetchRemote = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_data')
                    .select('value')
                    .eq('key', key)
                    .single()

                if (data && data.value !== null && data.value !== undefined) {
                    setStoredValue(data.value)
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(key, JSON.stringify(data.value))
                    }
                }
            } catch (err) {
                console.error("Error fetching synced state:", err)
            }
        }

        fetchRemote()

        const channel = supabase
            .channel(`public:user_data:key=eq.${key}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_data',
                    filter: `key=eq.${key}`
                },
                (payload) => {
                    const newValue = payload.new.value as T
                    console.log(`Received update for ${key}:`, newValue)
                    setStoredValue(newValue)

                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(key, JSON.stringify(newValue))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [key])

    // 3. Setter function: Updates Local, LocalStorage, AND Supabase
    const setValue = async (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value

            // Update React State
            setStoredValue(valueToStore)

            // Update LocalStorage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }

            // Update Supabase (Upsert)
            const { error } = await supabase
                .from('user_data')
                .upsert({
                    key,
                    value: valueToStore,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })

            if (error) throw error

        } catch (error) {
            console.log("Error saving synced state:", error)
        }
    }

    return [storedValue, setValue] as const
}
