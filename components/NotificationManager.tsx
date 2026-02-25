"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Trash2, Save } from "lucide-react";

interface Schedule {
    id: string;
    time: string; // "HH:MM"
    message: string;
    enabled: boolean;
}

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationManager() {
    console.log("NotificationManager component is rendering");
    const [isSupported, setIsSupported] = useState(true); // Default to true, will check on mount
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [newTime, setNewTime] = useState("");
    const [newMessage, setNewMessage] = useState("");

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Check if THIS specific device's subscription is in the database
            try {
                const response = await fetch('/api/user_data?key=push_subscriptions');
                if (response.ok) {
                    const data = await response.json();
                    if (data.value && Array.isArray(data.value)) {
                        const exists = data.value.some((sub: any) => sub.endpoint === subscription.endpoint);
                        setIsSubscribed(exists);
                    } else if (data.value && data.value.endpoint === subscription.endpoint) {
                        // Fallback for old single subscription format
                        setIsSubscribed(true);
                    } else {
                        setIsSubscribed(false);
                    }
                }
            } catch (e) {
                console.error("Could not verify subscription against DB", e);
                setIsSubscribed(false); // Default to false if DB check fails
            }
        } else {
            setIsSubscribed(false);
        }
    };

    const loadSchedules = async () => {
        try {
            const response = await fetch('/api/user_data?key=notification_schedules');
            if (response.ok) {
                const data = await response.json();
                if (data.value) setSchedules(data.value);
            }
        } catch (e) {
            console.error("Could not load schedules", e);
        }
    };

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            checkSubscription();
            loadSchedules();
        } else {
            setIsSupported(false);
        }
    }, []);

    const subscribeButtonOnClick = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY!)
                });

                await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription)
                });
                setIsSubscribed(true);
                alert("Successfully enabled notifications for this device!");
            } else {
                alert("Notification permission denied.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to subscribe");
        }
    };

    const saveSchedulesToDb = async (newSchedules: Schedule[]) => {
        try {
            await fetch("/api/push/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSchedules)
            });
        } catch (e) {
            console.error("Failed to save", e);
        }
    };

    const addSchedule = () => {
        if (!newTime || !newMessage) return;
        const newSchedule = {
            id: crypto.randomUUID(),
            time: newTime,
            message: newMessage,
            enabled: true
        };
        const updated = [...schedules, newSchedule];
        setSchedules(updated);
        saveSchedulesToDb(updated);
        setNewTime("");
        setNewMessage("");
    };

    const toggleSchedule = (id: string) => {
        const updated = schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
        setSchedules(updated);
        saveSchedulesToDb(updated);
    };

    const deleteSchedule = (id: string) => {
        const updated = schedules.filter(s => s.id !== id);
        setSchedules(updated);
        saveSchedulesToDb(updated);
    };

    if (typeof window !== "undefined" && !isSupported) {
        console.log("NotificationManager: Push notifications not supported or service worker not found.");
        return <div className="p-4 bg-zinc-900 rounded-lg text-zinc-400">Push notifications are not supported on this device/browser. Add to Home Screen first.</div>;
    }

    console.log("NotificationManager: Rendering main UI. isSubscribed:", isSubscribed);

    return (
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-zinc-400" />
                    Scheduled Notifications
                </h3>
                {!isSubscribed ? (
                    <button
                        onClick={subscribeButtonOnClick}
                        className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md font-medium text-sm hover:bg-white transition-colors"
                    >
                        Enable on this Device
                    </button>
                ) : (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                        Enabled on this Device
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-zinc-800">
                        <div className="flex flex-col flex-1">
                            <span className="text-lg font-mono text-zinc-200">{schedule.time}</span>
                            <span className="text-sm text-zinc-400">{schedule.message}</span>
                        </div>
                        <button
                            onClick={() => toggleSchedule(schedule.id)}
                            className={`p-2 rounded-md ${schedule.enabled ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800/50'}`}
                        >
                            {schedule.enabled ? 'On' : 'Off'}
                        </button>
                        <button
                            onClick={() => deleteSchedule(schedule.id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {isSubscribed && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800">
                        <h4 className="text-sm font-medium text-zinc-400">Add New Notification</h4>
                        <div className="flex gap-2">
                            <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
                            />
                            <input
                                type="text"
                                placeholder="Notification Message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
                            />
                            <button
                                onClick={addSchedule}
                                disabled={!newTime || !newMessage}
                                className="p-2 bg-zinc-800 text-zinc-100 rounded-md hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
