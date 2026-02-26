"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Cpu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils folder

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, sendMessage, status } = useChat();
    const isLoading = status === 'submitted' || status === 'streaming';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <Cpu className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-stone-200">Room Ops Assistant</h3>
                                <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    System Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                                <Cpu className="w-12 h-12 text-stone-600" />
                                <p className="text-sm text-stone-500 font-mono">Awaiting your command, operator.</p>
                            </div>
                        ) : (
                            messages.map((m: any) => (
                                <div key={m.id} className={cn(
                                    "flex w-full",
                                    m.role === 'user' ? "justify-end" : "justify-start"
                                )}>
                                    <div className={cn(
                                        "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-stone-800 text-stone-200 border border-stone-700 rounded-tr-sm"
                                            : "bg-orange-900/10 text-orange-100/90 border border-orange-500/20 rounded-tl-sm backdrop-blur-sm"
                                    )}>
                                        {m.content}
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start w-full text-orange-500/50">
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-stone-800 bg-stone-900">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-stone-600"
                                value={input}
                                placeholder="Initialize instruction protocol..."
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-500"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-95 group border relative",
                    isOpen
                        ? "bg-stone-800 border-stone-700 text-stone-400"
                        : "bg-stone-900 border-orange-500/50 text-orange-400 overflow-hidden"
                )}
            >
                {!isOpen && (
                    <div className="absolute inset-0 bg-orange-500/10 animate-pulse rounded-full" />
                )}
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6 group-hover:text-orange-300 transition-colors relative z-10" />
                )}
            </button>
        </div>
    );
}
