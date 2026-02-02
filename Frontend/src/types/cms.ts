export interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_type: 'none' | 'internal' | 'external';
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPage {
  id: string;
  page_key: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'url' | 'email' | 'phone';
  category: 'branding' | 'contact' | 'social' | 'general';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  background_image_url: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeaturedMenuSection {
  id: string;
  title: string;
  subtitle: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExploreMenuSection {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string;
  button_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  location: string;
  price: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_title: string;
  client_company: string | null;
  client_image_url: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FooterSection {
  id: string;
  company_name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  address: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  copyright_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadyToCreateSection {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  background_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}