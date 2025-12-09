
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { chatService, Message } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
    bookingId: string;
    currentUserId: string;
}

export function ChatInterface({ bookingId, currentUserId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        const subscription = chatService.subscribeToMessages(bookingId, (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [bookingId]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const loadMessages = async () => {
        try {
            const data = await chatService.fetchMessages(bookingId);
            setMessages(data);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsLoading(true);
        try {
            await chatService.sendMessage(bookingId, newMessage);
            setNewMessage("");
            // Optimistic update not needed as we have realtime subscription
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] border border-border rounded-xl overflow-hidden bg-card/30">
            <div className="p-4 border-b border-border bg-card/50">
                <h3 className="font-semibold text-sm">Chat with {currentUserId ? "Vendor/Customer" : "User"}</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-secondary text-secondary-foreground rounded-tl-none"
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <span className="text-[10px] opacity-70 mt-1 block">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card/50 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background"
                />
                <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
    );
}
