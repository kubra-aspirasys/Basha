/*
  # Site Settings Management

  ## Overview
  Manage global site settings including logos, titles, and other configuration.

  ## 1. New Tables

  ### `site_settings`
  - `id` (uuid, primary key) - Unique identifier
  - `key` (text, unique) - Setting key (site_title, site_logo, admin_logo, etc.)
  - `value` (text) - Setting value (text or URL)
  - `type` (text) - Type of setting (text, image, url, email, phone)
  - `category` (text) - Category (general, branding, contact, social)
  - `description` (text, nullable) - Description of the setting
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on site_settings table
  - Public read access for all settings
  - Authenticated users can manage settings

  ## 3. Important Notes
  - Settings are stored as key-value pairs
  - Flexible structure for easy expansion
  - Default values inserted for common settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'text',
  category text NOT NULL DEFAULT 'general',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
  ('site_title', 'SR FoodKraft', 'text', 'branding', 'Main website title'),
  ('site_tagline', 'Delicious Food Delivered Fresh', 'text', 'branding', 'Website tagline/subtitle'),
  ('site_logo', '', 'image', 'branding', 'Main website logo URL'),
  ('site_favicon', '', 'image', 'branding', 'Website favicon URL'),
  ('admin_title', 'SR FoodKraft Admin', 'text', 'branding', 'Admin panel title'),
  ('admin_logo', '', 'image', 'branding', 'Admin panel logo URL'),
  ('contact_email', 'info@srfoodkraft.com', 'email', 'contact', 'Contact email address'),
  ('contact_phone', '+1 (555) 123-4567', 'phone', 'contact', 'Contact phone number'),
  ('contact_address', '123 Food Street, City, Country', 'text', 'contact', 'Physical address'),
  ('social_facebook', '', 'url', 'social', 'Facebook page URL'),
  ('social_instagram', '', 'url', 'social', 'Instagram profile URL'),
  ('social_twitter', '', 'url', 'social', 'Twitter profile URL'),
  ('footer_text', '© 2025 SR FoodKraft. All rights reserved.', 'text', 'general', 'Footer copyright text')
ON CONFLICT (key) DO NOTHING;