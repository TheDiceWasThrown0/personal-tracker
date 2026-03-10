"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Terminal, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const C = { bg: '#f5f0e8', fg: '#1a1612', red: '#bf1a0a', muted: '#7a7060', border: '#1a1612', cardBg: '#ede8de', softBorder: '#c8c0b0' }
const HISTORY_KEY = 'ai_chat_history_v1';

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, setMessages } = useChat({
        onError: (err) => console.error('Chat error:', err),
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    // Load history from Supabase once on mount
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('user_data')
                .select('value')
                .eq('key', HISTORY_KEY)
                .single();
            if (Array.isArray(data?.value) && data.value.length > 0) {
                setMessages(data.value);
            }
        };
        load();
    }, []);

    // Persist whenever a response finishes
    useEffect(() => {
        if (status === 'ready' && messages.length > 0) {
            const save = async () => {
                await supabase.from('user_data').upsert(
                    { key: HISTORY_KEY, value: messages.slice(-40), updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );
            };
            save();
        }
    }, [status]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
    };

    const handleClear = async () => {
        setMessages([]);
        await supabase.from('user_data').upsert(
            { key: HISTORY_KEY, value: [], updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );
    };

    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat window */}
            {isOpen && (
                <div style={{
                    marginBottom: '0.75rem',
                    width: '380px',
                    height: '500px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: C.bg,
                    border: `1.5px solid ${C.border}`,
                }}>
                    {/* Header */}
                    <div style={{ padding: '0.6rem 0.875rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.cardBg, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Terminal style={{ width: '13px', height: '13px', color: C.red }} />
                            <div>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.fg }}>Room Assistant</p>
                                <p style={{ fontSize: '0.55rem', color: C.muted }}>reads + writes your tracker data</p>
                            </div>
                        </div>
                        <button onClick={handleClear} className="btn-wire" style={{ padding: '0.2rem 0.4rem' }} title="Clear conversation">
                            <Trash2 style={{ width: '11px', height: '11px' }} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.4 }}>
                                <Terminal style={{ width: '24px', height: '24px', color: C.muted }} />
                                <p style={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center', lineHeight: 1.6 }}>
                                    Ask about your data.<br />I can read and update your tracker.
                                </p>
                            </div>
                        ) : (
                            messages.map((m: any) => {
                                const text = m.parts?.find((p: any) => p.type === 'text')?.text ?? m.content ?? '';
                                if (!text && m.role !== 'user') return null;
                                return (
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
                                            {text}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingLeft: '0.25rem' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{ width: '4px', height: '4px', background: C.red, opacity: 0.7, animation: `pulse 1s ${i * 0.2}s infinite` }} />
                                ))}
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
                                autoFocus
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="btn-wire" style={{ padding: '0.35rem 0.75rem', flexShrink: 0 }}>
                                <Send style={{ width: '11px', height: '11px' }} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-wire"
                style={{
                    width: '44px', height: '44px', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOpen ? C.fg : 'transparent',
                    color: isOpen ? C.bg : C.fg,
                }}
            >
                {isOpen ? <X style={{ width: '16px', height: '16px' }} /> : <MessageSquare style={{ width: '16px', height: '16px' }} />}
            </button>
        </div>
    );
}
