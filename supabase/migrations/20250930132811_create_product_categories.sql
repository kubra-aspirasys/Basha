/*
  # Product Categories Management

  ## Overview
  Manage product categories with veg/non-veg type classification for menu items.

  ## 1. New Tables

  ### `product_categories`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Category name (e.g., Starters, Main Course, Desserts)
  - `slug` (text, unique) - URL-friendly slug
  - `description` (text, nullable) - Category description
  - `icon` (text, nullable) - Icon name or emoji
  - `image_url` (text, nullable) - Category image URL
  - `is_active` (boolean) - Whether category is active
  - `display_order` (integer) - Order for display
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `product_types`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Type name (Veg, Non-Veg, Egg, Vegan)
  - `slug` (text, unique) - URL-friendly slug
  - `icon` (text, nullable) - Icon/emoji indicator
  - `color` (text) - Color code for UI display
  - `is_active` (boolean) - Whether type is active
  - `display_order` (integer) - Order for display
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on both tables
  - Public read access for active categories/types
  - Authenticated users can manage categories/types

  ## 3. Important Notes
  - Pre-populated with common food categories
  - Pre-populated with standard food types (Veg/Non-Veg)
  - Categories and types can be used for menu item classification
*/

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  color text NOT NULL DEFAULT '#6B7280',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_order ON product_categories(display_order);

CREATE INDEX IF NOT EXISTS idx_product_types_slug ON product_types(slug);
CREATE INDEX IF NOT EXISTS idx_product_types_active ON product_types(is_active);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active categories"
  ON product_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active types"
  ON product_types FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage types"
  ON product_types FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON product_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default product categories
INSERT INTO product_categories (name, slug, description, icon, display_order) VALUES
  ('All', 'all', 'All menu items', '📋', 0),
  ('Starters', 'starters', 'Appetizers and starters', '🍢', 1),
  ('Main Course', 'main-course', 'Main dishes and entrees', '🍛', 2),
  ('Rice/Biryani', 'rice-biryani', 'Rice dishes and biryanis', '🍚', 3),
  ('Breads', 'breads', 'Indian breads', '🫓', 4),
  ('Desserts', 'desserts', 'Sweet dishes and desserts', '🍰', 5),
  ('Beverages', 'beverages', 'Drinks and beverages', '🥤', 6),
  ('Gravies', 'gravies', 'Curry and gravy dishes', '🍲', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert default product types
INSERT INTO product_types (name, slug, icon, color, display_order) VALUES
  ('Veg', 'veg', '🟢', '#22C55E', 1),
  ('Non-Veg', 'non-veg', '🔴', '#EF4444', 2),
  ('Egg', 'egg', '🟡', '#F59E0B', 3),
  ('Vegan', 'vegan', '🟢', '#10B981', 4)
ON CONFLICT (slug) DO NOTHING;