/*
  # Create Menu Items Table

  ## Overview
  Create menu items table with category, type (veg/non-veg), quantity specifications, and image handling.

  ## 1. New Tables

  ### `menu_items`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Item name
  - `description` (text, nullable) - Item description
  - `price` (numeric) - Item price
  - `category_id` (uuid, nullable) - Links to product_categories
  - `type_id` (uuid, nullable) - Links to product_types (veg/non-veg)
  - `image_url` (text, nullable) - Item image URL
  - `unit_type` (text) - Unit of measurement (kg, piece, plate, bowl, liter, etc.)
  - `min_order_qty` (numeric) - Minimum order quantity
  - `max_order_qty` (numeric, nullable) - Maximum order quantity per order
  - `stock_quantity` (integer, nullable) - Available stock
  - `preparation_time` (integer, nullable) - Prep time in minutes
  - `is_available` (boolean) - Whether item is available
  - `is_featured` (boolean) - Whether item is featured
  - `featured_priority` (integer, nullable) - Featured display priority
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on menu_items table
  - Public read access for available items
  - Authenticated users can manage menu items

  ## 3. Important Notes
  - Category and type can be null for uncategorized items
  - Min order qty defaults to 1
  - Unit type defaults to 'piece'
  - Supports both image URL and file upload
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  type_id uuid REFERENCES product_types(id) ON DELETE SET NULL,
  image_url text,
  unit_type text DEFAULT 'piece',
  min_order_qty numeric DEFAULT 1,
  max_order_qty numeric,
  stock_quantity integer,
  preparation_time integer,
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  featured_priority integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(type_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured, featured_priority);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read available menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();