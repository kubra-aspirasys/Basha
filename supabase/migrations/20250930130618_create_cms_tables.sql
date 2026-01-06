/*
  # CMS Management System

  ## Overview
  Complete CMS solution for SR FoodKraft admin panel including image gallery,
  banners, content pages, FAQs, and blog management.

  ## 1. New Tables

  ### `gallery_images`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Image title
  - `description` (text, nullable) - Image description
  - `image_url` (text) - Supabase storage URL
  - `alt_text` (text) - Alt text for accessibility
  - `category` (text, default 'general') - Category (food, restaurant, events, etc.)
  - `is_active` (boolean, default true) - Visibility status
  - `display_order` (integer, default 0) - Sort order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `banners`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Banner title
  - `subtitle` (text, nullable) - Banner subtitle
  - `image_url` (text) - Banner image URL
  - `link_url` (text, nullable) - Click destination URL
  - `link_type` (text, default 'none') - Link type (none, internal, external)
  - `is_active` (boolean, default true) - Active status
  - `display_order` (integer, default 0) - Sort order for slider
  - `start_date` (timestamptz, nullable) - When to start showing
  - `end_date` (timestamptz, nullable) - When to stop showing
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `content_pages`
  - `id` (uuid, primary key) - Unique identifier
  - `page_key` (text, unique) - Unique key (about_us, terms, privacy, etc.)
  - `title` (text) - Page title
  - `content` (text) - Rich text content (HTML)
  - `meta_title` (text, nullable) - SEO meta title
  - `meta_description` (text, nullable) - SEO meta description
  - `is_published` (boolean, default false) - Published status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `faqs`
  - `id` (uuid, primary key) - Unique identifier
  - `question` (text) - FAQ question
  - `answer` (text) - FAQ answer
  - `category` (text, default 'general') - Category (ordering, delivery, payment, etc.)
  - `is_active` (boolean, default true) - Active status
  - `display_order` (integer, default 0) - Sort order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `blog_posts`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly slug
  - `excerpt` (text, nullable) - Short description
  - `content` (text) - Full post content (HTML)
  - `featured_image_url` (text, nullable) - Featured image
  - `author` (text, default 'SR FoodKraft') - Author name
  - `category` (text, default 'news') - Category (news, recipes, updates, etc.)
  - `tags` (text[], default '{}') - Array of tags
  - `is_published` (boolean, default false) - Published status
  - `published_at` (timestamptz, nullable) - Publication date
  - `views_count` (integer, default 0) - View counter
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated admin users to manage all content
  - Add policies for public read access to active/published content

  ## 3. Indexes
  - Index on category fields for filtering
  - Index on is_active/is_published for quick filtering
  - Index on display_order for sorting
  - Index on slug for blog posts
  - Index on created_at for chronological sorting

  ## 4. Important Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically set with default values
  - Boolean flags control visibility/publication status
  - Display order allows manual sorting
  - Blog posts support tags as PostgreSQL arrays
*/

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  alt_text text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_images(display_order);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active gallery images"
  ON gallery_images FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage gallery images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  link_type text DEFAULT 'none',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Authenticated users can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Content Pages Table
CREATE TABLE IF NOT EXISTS content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_title text,
  meta_description text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_pages_key ON content_pages(page_key);
CREATE INDEX IF NOT EXISTS idx_content_pages_published ON content_pages(is_published);

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published content pages"
  ON content_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage content pages"
  ON content_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(display_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author text DEFAULT 'SR FoodKraft',
  category text DEFAULT 'news',
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_tags ON blog_posts USING gin(tags);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default content pages
INSERT INTO content_pages (page_key, title, content, is_published) VALUES
  ('about_us', 'About SR FoodKraft', '<h1>About SR FoodKraft</h1><p>Welcome to SR FoodKraft - your premier destination for delicious food.</p>', true),
  ('terms_conditions', 'Terms & Conditions', '<h1>Terms & Conditions</h1><p>Please read these terms carefully before using our service.</p>', true),
  ('privacy_policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', true)
ON CONFLICT (page_key) DO NOTHING;