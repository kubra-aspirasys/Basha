/*
  # Restaurant Settings, Notifications & Customer Management

  ## Overview
  Complete system for restaurant operations, notifications, and customer management with loyalty program.

  ## 1. New Tables

  ### `restaurant_settings`
  - `id` (uuid, primary key) - Unique identifier
  - `restaurant_name` (text) - Restaurant name
  - `restaurant_logo` (text, nullable) - Logo URL
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `address` (text) - Physical address
  - `currency` (text) - Currency code (e.g., INR, USD)
  - `tax_rate` (numeric) - Tax percentage
  - `delivery_fee` (numeric) - Base delivery fee
  - `minimum_order_amount` (numeric) - Minimum order amount
  - `updated_at` (timestamptz) - Last update timestamp

  ### `operating_hours`
  - `id` (uuid, primary key) - Unique identifier
  - `day_of_week` (integer) - 0=Sunday, 1=Monday, etc.
  - `is_open` (boolean) - Whether restaurant is open
  - `open_time` (time) - Opening time
  - `close_time` (time) - Closing time
  - `updated_at` (timestamptz) - Last update timestamp

  ### `closed_dates`
  - `id` (uuid, primary key) - Unique identifier
  - `date` (date) - Closed date
  - `reason` (text) - Reason for closure
  - `created_at` (timestamptz) - Creation timestamp

  ### `delivery_zones`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Zone name
  - `postal_codes` (text[]) - List of postal codes
  - `delivery_fee` (numeric) - Delivery fee for zone
  - `min_delivery_time` (integer) - Minimum delivery time in minutes
  - `max_delivery_time` (integer) - Maximum delivery time in minutes
  - `is_active` (boolean) - Whether zone is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `payment_methods`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Payment method name (Cash, Card, UPI, etc.)
  - `type` (text) - Type (cash, online, wallet)
  - `is_active` (boolean) - Whether method is active
  - `display_order` (integer) - Display order
  - `icon` (text, nullable) - Icon/emoji
  - `created_at` (timestamptz) - Creation timestamp

  ### `notifications`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `type` (text) - Type (order, promotion, system, alert)
  - `priority` (text) - Priority (low, medium, high, critical)
  - `recipient_type` (text) - Recipient (all, customer, admin, specific)
  - `recipient_id` (uuid, nullable) - Specific recipient ID
  - `is_read` (boolean) - Whether notification is read
  - `data` (jsonb, nullable) - Additional data
  - `created_at` (timestamptz) - Creation timestamp

  ### `notification_preferences`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User ID
  - `push_enabled` (boolean) - Push notifications enabled
  - `email_enabled` (boolean) - Email notifications enabled
  - `sms_enabled` (boolean) - SMS notifications enabled
  - `order_updates` (boolean) - Order update notifications
  - `promotions` (boolean) - Promotional notifications
  - `news` (boolean) - News notifications
  - `updated_at` (timestamptz) - Last update timestamp

  ### `loyalty_points`
  - `id` (uuid, primary key) - Unique identifier
  - `customer_id` (uuid) - Customer ID (FK)
  - `points` (integer) - Current points balance
  - `lifetime_points` (integer) - Total points earned
  - `tier` (text) - Loyalty tier (bronze, silver, gold, platinum)
  - `updated_at` (timestamptz) - Last update timestamp

  ### `loyalty_transactions`
  - `id` (uuid, primary key) - Unique identifier
  - `customer_id` (uuid) - Customer ID (FK)
  - `order_id` (uuid, nullable) - Related order ID
  - `points` (integer) - Points earned/spent (positive/negative)
  - `type` (text) - Type (earned, redeemed, expired, bonus)
  - `description` (text) - Transaction description
  - `created_at` (timestamptz) - Creation timestamp

  ### `customer_tags`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Tag name
  - `color` (text) - Color code
  - `description` (text, nullable) - Tag description
  - `created_at` (timestamptz) - Creation timestamp

  ### `customer_tag_assignments`
  - `id` (uuid, primary key) - Unique identifier
  - `customer_id` (uuid) - Customer ID (FK)
  - `tag_id` (uuid) - Tag ID (FK)
  - `created_at` (timestamptz) - Creation timestamp

  ### `customer_feedback`
  - `id` (uuid, primary key) - Unique identifier
  - `customer_id` (uuid) - Customer ID (FK)
  - `order_id` (uuid, nullable) - Related order ID
  - `rating` (integer) - Rating (1-5)
  - `comment` (text, nullable) - Feedback comment
  - `category` (text) - Category (food, delivery, service, app)
  - `status` (text) - Status (pending, reviewed, resolved)
  - `created_at` (timestamptz) - Creation timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Public read for restaurant settings and operating hours
  - Authenticated users can manage all settings
  - Customers can access their own loyalty and feedback data

  ## 3. Important Notes
  - Restaurant settings initialized with default values
  - Operating hours set for all 7 days
  - Common payment methods pre-populated
  - Loyalty system with tier-based rewards
  - Comprehensive notification system
*/

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL DEFAULT 'SR FoodKraft',
  restaurant_logo text,
  contact_email text NOT NULL DEFAULT 'info@srfoodkraft.com',
  contact_phone text NOT NULL DEFAULT '+91 1234567890',
  address text NOT NULL DEFAULT '123 Food Street, City, Country',
  currency text NOT NULL DEFAULT 'INR',
  tax_rate numeric DEFAULT 5.0,
  delivery_fee numeric DEFAULT 50.0,
  minimum_order_amount numeric DEFAULT 100.0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operating_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean DEFAULT true,
  open_time time DEFAULT '09:00:00',
  close_time time DEFAULT '22:00:00',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

CREATE TABLE IF NOT EXISTS closed_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  postal_codes text[],
  delivery_fee numeric DEFAULT 50.0,
  min_delivery_time integer DEFAULT 30,
  max_delivery_time integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  priority text DEFAULT 'medium',
  recipient_type text NOT NULL,
  recipient_id uuid,
  is_read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  order_updates boolean DEFAULT true,
  promotions boolean DEFAULT true,
  news boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL UNIQUE,
  points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  order_id uuid,
  points integer NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, tag_id)
);

CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  order_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  category text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_customer ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_order ON customer_feedback(order_id);

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read restaurant settings"
  ON restaurant_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage restaurant settings"
  ON restaurant_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read operating hours"
  ON operating_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage operating hours"
  ON operating_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read closed dates"
  ON closed_dates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage closed dates"
  ON closed_dates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active delivery zones"
  ON delivery_zones FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage delivery zones"
  ON delivery_zones FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active payment methods"
  ON payment_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_type = 'admin' OR recipient_id = auth.uid());

CREATE POLICY "Authenticated users can manage notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can read loyalty points"
  ON loyalty_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage loyalty points"
  ON loyalty_points FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their loyalty transactions"
  ON loyalty_transactions FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Authenticated users can manage loyalty transactions"
  ON loyalty_transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read customer tags"
  ON customer_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customer tags"
  ON customer_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read tag assignments"
  ON customer_tag_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tag assignments"
  ON customer_tag_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read feedback"
  ON customer_feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can submit feedback"
  ON customer_feedback FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Authenticated users can manage feedback"
  ON customer_feedback FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_restaurant_settings_updated_at BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operating_hours_updated_at BEFORE UPDATE ON operating_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default restaurant settings
INSERT INTO restaurant_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default operating hours (Monday-Sunday)
INSERT INTO operating_hours (day_of_week, is_open, open_time, close_time) VALUES
  (0, true, '09:00:00', '22:00:00'),
  (1, true, '09:00:00', '22:00:00'),
  (2, true, '09:00:00', '22:00:00'),
  (3, true, '09:00:00', '22:00:00'),
  (4, true, '09:00:00', '22:00:00'),
  (5, true, '09:00:00', '22:00:00'),
  (6, true, '09:00:00', '22:00:00')
ON CONFLICT (day_of_week) DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (name, type, icon, display_order) VALUES
  ('Cash on Delivery', 'cash', '💵', 1),
  ('UPI', 'online', '📱', 2)
ON CONFLICT (name) DO NOTHING;

-- Insert default customer tags
INSERT INTO customer_tags (name, color, description) VALUES
  ('VIP', '#F59E0B', 'VIP customers'),
  ('Regular', '#10B981', 'Regular customers'),
  ('New', '#3B82F6', 'New customers'),
  ('High Value', '#8B5CF6', 'High value customers'),
  ('At Risk', '#EF4444', 'Customers at risk of churning')
ON CONFLICT (name) DO NOTHING;