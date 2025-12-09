-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Booking details
  issue_description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  address TEXT NOT NULL,
  
  -- Pricing
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- AI diagnosis (optional)
  ai_diagnosis JSONB,
  
  -- Images
  issue_images TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ratings and reviews
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  vendor_rating INTEGER CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
  vendor_review TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to allow re-running this script
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Vendors can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Vendors can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their bookings" ON bookings;

-- Policies
-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Vendors can view bookings assigned to them
CREATE POLICY "Vendors can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Vendors can update their booking status
CREATE POLICY "Vendors can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Customers can update their bookings (cancel, rate, etc.)
CREATE POLICY "Customers can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid());
