/*
  # Orders and Order Items

  ## Overview
  Adds orders and order_items tables to support checkout and admin order management.

  ## Tables
  - orders: captures order header data
  - order_items: line items linked to orders

  ## Security
  - RLS enabled on both tables
  - Public insert/select for demo; adjust to tighter policies when auth roles are available
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid,
  customer_name text NOT NULL,
  customer_phone text,
  delivery_address text,
  order_type text NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  subtotal numeric NOT NULL,
  gst_amount numeric DEFAULT 0,
  delivery_charges numeric DEFAULT 0,
  service_charges numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Demo-friendly policies: allow reading/writing with anon key. Tighten for production.
CREATE POLICY "Public can insert orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can read orders" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can update orders" ON orders FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public can delete orders" ON orders FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public can insert order items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can read order items" ON order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can update order items" ON order_items FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public can delete order items" ON order_items FOR DELETE TO anon, authenticated USING (true);
