-- Add columns to bookings table for negotiation
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS negotiated_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_status TEXT DEFAULT 'pending' CHECK (price_status IN ('pending', 'negotiating', 'agreed', 'fixed'));

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID ERRORS
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON messages;
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON messages;

-- Create policies for messages
-- Allow users to view messages if they are the customer OR the vendor owner
CREATE POLICY "Users can view messages for their bookings" 
ON messages FOR SELECT 
USING (
    -- User is the customer
    auth.uid() IN (SELECT customer_id FROM bookings WHERE id = messages.booking_id)
    OR
    -- User is the vendor (check via vendors table)
    auth.uid() IN (
        SELECT v.user_id 
        FROM vendors v 
        JOIN bookings b ON b.vendor_id = v.id 
        WHERE b.id = messages.booking_id
    )
);

-- Allow users to insert messages if they are the customer OR the vendor owner
CREATE POLICY "Users can send messages for their bookings" 
ON messages FOR INSERT 
WITH CHECK (
    -- User is the customer
    auth.uid() IN (SELECT customer_id FROM bookings WHERE id = booking_id)
    OR
    -- User is the vendor (check via vendors table)
    auth.uid() IN (
        SELECT v.user_id 
        FROM vendors v 
        JOIN bookings b ON b.vendor_id = v.id 
        WHERE b.id = booking_id
    )
);

-- Enable Realtime for messages table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END
$$;
