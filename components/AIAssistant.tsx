"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Terminal, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const C = { bg: '#f5f0e8', fg: '#1a1612', red: '#bf1a0a', muted: '#7a7060', border: '#1a1612', cardBg: '#ede8de', softBorder: '#c8c0b0' }
const HISTORY_KEY = 'ai_chat_history_v1';

function ChatWindow({ pastMessages, onMessagesChange, onClear }: {
    pastMessages: any[];
    onMessagesChange: (msgs: any[]) => void;
    onClear: () => void;
}) {
    const [input, setInput] = useState('');
    const { messages, sendMessage, status } = useChat();
    const isLoading = status === 'submitted' || status === 'streaming';
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const allMessages = [...pastMessages, ...messages];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages.length]);

    useEffect(() => {
        if (status === 'ready' && messages.length > 0) {
            onMessagesChange([...pastMessages, ...messages]);
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
            style={{
                marginBottom: '0.75rem',
                width: '380px',
                height: '500px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                background: C.bg,
                border: `1.5px solid ${C.border}`,
            }}
        >
            {/* Header */}
            <div style={{ padding: '0.6rem 0.875rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.cardBg, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal style={{ width: '13px', height: '13px', color: C.red }} />
                    <div>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.fg }}>Room Assistant</p>
                        <p style={{ fontSize: '0.55rem', color: C.muted, letterSpacing: '0.06em' }}>reads + writes your tracker data</p>
                    </div>
                </div>
                <button onClick={onClear} className="btn-wire" style={{ padding: '0.2rem 0.4rem' }} title="Clear">
                    <Trash2 style={{ width: '11px', height: '11px' }} />
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {allMessages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.4 }}>
                        <Terminal style={{ width: '24px', height: '24px', color: C.muted }} />
                        <p style={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center', lineHeight: 1.6 }}>
                            Ask about your data.<br />I can read and update your tracker.
                        </p>
                    </div>
                ) : (
                    allMessages.map((m: any) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '85%',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.72rem',
                                lineHeight: 1.6,
                                background: m.role === 'user' ? C.fg : C.cardBg,
                                color: m.role === 'user' ? C.bg : C.fg,
                                border: `1px solid ${m.role === 'user' ? C.fg : C.softBorder}`,
                                borderLeft: m.role === 'assistant' ? `3px solid ${C.red}` : undefined,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {m.parts?.map((part: any, i: number) => {
                                    if (part.type === 'text') return <span key={i}>{part.text}</span>;
                                    return null;
                                })}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{ width: '3px', height: '3px', background: C.red, animation: 'pulse 1s infinite' }} />
                        <div style={{ width: '3px', height: '3px', background: C.red, animation: 'pulse 1s 0.2s infinite' }} />
                        <div style={{ width: '3px', height: '3px', background: C.red, animation: 'pulse 1s 0.4s infinite' }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem', borderTop: `1.5px solid ${C.border}`, background: C.cardBg, flexShrink: 0 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <input
                        className="input-line"
                        style={{ flex: 1, fontSize: '0.72rem' }}
                        value={input}
                        placeholder="ask about your data..."
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="btn-wire" style={{ padding: '0.35rem 0.75rem', flexShrink: 0 }}>
                        <Send style={{ width: '11px', height: '11px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMessages, setInitialMessages] = useState<any[] | null>(null);
    const [chatKey, setChatKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase.from('user_data').select('value').eq('key', HISTORY_KEY).single();
                setInitialMessages(Array.isArray(data?.value) ? data.value : []);
            } catch {
                setInitialMessages([]);
            }
        };
        load();
    }, []);

    const handleMessagesChange = async (messages: any[]) => {
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
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isOpen && initialMessages !== null && (
                <ChatWindow key={chatKey} pastMessages={initialMessages} onMessagesChange={handleMessagesChange} onClear={handleClear} />
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-wire"
                style={{
                    width: '44px',
                    height: '44px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isOpen ? C.fg : 'transparent',
                    color: isOpen ? C.bg : C.fg,
                    borderColor: C.border,
                }}
            >
                {isOpen ? <X style={{ width: '16px', height: '16px' }} /> : <MessageSquare style={{ width: '16px', height: '16px' }} />}
            </button>
        </div>
    );
}
