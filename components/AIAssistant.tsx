"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

const HISTORY_KEY = 'ai_chat_history_v1';

function ChatWindow({ initialMessages, onMessagesChange, onClear }: {
    initialMessages: any[];
    onMessagesChange: (msgs: any[]) => void;
    onClear: () => void;
}) {
    const [input, setInput] = useState('');
    const { messages, sendMessage, status } = useChat({ initialMessages });
    const isLoading = status === 'submitted' || status === 'streaming';
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Persist when a response completes
    useEffect(() => {
        if (status === 'ready' && messages.length > 0) {
            onMessagesChange(messages);
        }
    }, [status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
    };

    return (
        <div
            className="mb-4 w-[360px] sm:w-[420px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{
                height: '520px',
                maxHeight: '80vh',
                background: 'hsl(24 7% 10%)',
                border: '1px solid hsl(24 6% 17%)',
                borderRadius: '1rem',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid hsl(24 6% 15%)' }}>
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4" style={{ color: '#e06d34' }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'hsl(30 18% 88%)' }}>Room Assistant</p>
                        <p className="text-[10px]" style={{ color: 'hsl(30 8% 42%)' }}>Reads & writes your tracker data</p>
                    </div>
                </div>
                <button
                    onClick={onClear}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'hsl(30 8% 38%)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e06d34')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 8% 38%)')}
                    title="Clear conversation"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-40">
                        <Sparkles className="w-8 h-8" style={{ color: '#e06d34' }} />
                        <p className="text-sm" style={{ color: 'hsl(30 8% 50%)' }}>
                            Ask me anything about your data.<br />I can read and update your tracker.
                        </p>
                    </div>
                ) : (
                    messages.map((m: any) => (
                        <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                            <div
                                className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                                style={m.role === 'user'
                                    ? { background: 'hsl(24 7% 16%)', color: 'hsl(30 18% 88%)', borderBottomRightRadius: '4px' }
                                    : { background: 'hsl(22 40% 14%)', color: 'hsl(30 25% 85%)', border: '1px solid hsl(22 30% 22%)', borderBottomLeftRadius: '4px' }
                                }
                            >
                                {m.parts?.map((part: any, i: number) => {
                                    if (part.type === 'text') return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</span>;
                                    return null;
                                })}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: 'hsl(22 40% 14%)', border: '1px solid hsl(22 30% 22%)' }}>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#e06d34' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid hsl(24 6% 15%)' }}>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        className="flex-1 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-all"
                        style={{
                            background: 'hsl(24 7% 14%)',
                            border: '1px solid hsl(24 6% 20%)',
                            color: 'hsl(30 18% 88%)',
                        }}
                        value={input}
                        placeholder="Ask about your data..."
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl px-3.5 flex items-center justify-center transition-all disabled:opacity-40"
                        style={{ background: '#e06d34', color: '#fff' }}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMessages, setInitialMessages] = useState<any[] | null>(null);
    const [chatKey, setChatKey] = useState(0); // force remount ChatWindow when clearing

    // Load history from Supabase on mount
    useEffect(() => {
        supabase.from('user_data').select('value').eq('key', HISTORY_KEY).single()
            .then(({ data }) => {
                setInitialMessages(Array.isArray(data?.value) ? data.value : []);
            })
            .catch(() => setInitialMessages([]));
    }, []);

    const handleMessagesChange = async (messages: any[]) => {
        // Keep only last 40 messages to avoid bloat
        const trimmed = messages.slice(-40);
        await supabase.from('user_data').upsert(
            { key: HISTORY_KEY, value: trimmed, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );
    };

    const handleClear = async () => {
        await supabase.from('user_data').upsert(
            { key: HISTORY_KEY, value: [], updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );
        setInitialMessages([]);
        setChatKey(k => k + 1);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end">
            {isOpen && initialMessages !== null && (
                <ChatWindow
                    key={chatKey}
                    initialMessages={initialMessages}
                    onMessagesChange={handleMessagesChange}
                    onClear={handleClear}
                />
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                    background: isOpen ? 'hsl(24 7% 16%)' : '#e06d34',
                    border: `1px solid ${isOpen ? 'hsl(24 6% 22%)' : '#c85a24'}`,
                    color: '#fff',
                    boxShadow: isOpen ? 'none' : '0 4px 24px rgba(224, 109, 52, 0.35)',
                }}
            >
                {isOpen ? <X className="w-4.5 h-4.5" /> : <MessageSquare className="w-4.5 h-4.5" />}
            </button>
        </div>
    );
}
