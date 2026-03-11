import { useChat } from '@ai-sdk/react';
const chat = useChat();
chat.append({ role: 'user', content: "123" });
