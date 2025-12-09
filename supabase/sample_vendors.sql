-- Sample Vendor Data for Testing
-- Run this in your Supabase SQL Editor to add test vendors

-- First, you need to have a user in auth.users table
-- If you don't have one, sign up through your app first

-- Insert sample vendors for different categories
-- Note: Replace the user_id with an actual user ID from your auth.users table
-- You can get a user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Get the category IDs
DO $$
DECLARE
  electronics_cat_id UUID;
  vehicles_cat_id UUID;
  home_appliances_cat_id UUID;
  sample_user_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO electronics_cat_id FROM service_categories WHERE slug = 'electronics';
  SELECT id INTO vehicles_cat_id FROM service_categories WHERE slug = 'vehicles';
  SELECT id INTO home_appliances_cat_id FROM service_categories WHERE slug = 'home-appliances';
  
  -- Get a sample user ID (you may need to create a user first or use your own)
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, you'll need to sign up through your app first
  IF sample_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up through the app first.';
  END IF;
  
  -- Insert Electronics Vendors
  INSERT INTO vendors (user_id, business_name, description, hourly_rate, service_categories, is_verified, is_available, rating, total_reviews, service_radius_km)
  VALUES
    (sample_user_id, 'TechFix Solutions', 'Expert mobile and laptop repair services', 1500, ARRAY[electronics_cat_id], true, true, 4.8, 234, 10),
    (sample_user_id, 'QuickRepair Pro', 'Fast and reliable gadget repairs', 1200, ARRAY[electronics_cat_id], true, true, 4.7, 189, 15),
    (sample_user_id, 'GadgetCare Hub', 'Affordable electronics repair', 999, ARRAY[electronics_cat_id], false, true, 4.5, 156, 20);
  
  -- Insert Vehicle Vendors
  INSERT INTO vendors (user_id, business_name, description, hourly_rate, service_categories, is_verified, is_available, rating, total_reviews, service_radius_km)
  VALUES
    (sample_user_id, 'AutoCare Express', 'Professional car and bike servicing', 2000, ARRAY[vehicles_cat_id], true, true, 4.9, 312, 25),
    (sample_user_id, 'Bike Masters', 'Specialized bike repair and maintenance', 800, ARRAY[vehicles_cat_id], true, true, 4.6, 287, 12);
  
  -- Insert Home Appliances Vendors
  INSERT INTO vendors (user_id, business_name, description, hourly_rate, service_categories, is_verified, is_available, rating, total_reviews, service_radius_km)
  VALUES
    (sample_user_id, 'HomeServe Plus', 'AC, fridge, and appliance repairs', 1800, ARRAY[home_appliances_cat_id], true, true, 4.7, 198, 18),
    (sample_user_id, 'ApplianceFix Pro', 'Quick home appliance solutions', 1500, ARRAY[home_appliances_cat_id], true, true, 4.8, 245, 15);
  
  RAISE NOTICE 'Successfully inserted % vendors', 7;
END $$;

-- Verify the vendors were inserted
SELECT 
  v.business_name,
  v.hourly_rate,
  v.rating,
  v.is_verified,
  sc.name as category
FROM vendors v
LEFT JOIN service_categories sc ON sc.id = ANY(v.service_categories)
ORDER BY v.business_name;
