
import { supabase } from "@/integrations/supabase/client";

export interface Message {
    id: string;
    booking_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export const chatService = {
    async sendMessage(bookingId: string, content: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from('messages' as any)
            .insert({
                booking_id: bookingId,
                sender_id: user.id,
                content
            });

        if (error) throw error;
    },

    async fetchMessages(bookingId: string) {
        const { data, error } = await supabase
            .from('messages' as any)
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Message[];
    },

    subscribeToMessages(bookingId: string, onMessage: (message: Message) => void) {
        return supabase
            .channel(`chat:${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `booking_id=eq.${bookingId}`
                },
                (payload) => {
                    onMessage(payload.new as Message);
                }
            )
            .subscribe();
    }
};
