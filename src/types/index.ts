export type UserRole = 'admin' | 'customer';

export interface Admin {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  is_blocked: boolean;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  role?: 'customer';
  password?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  type_id?: string;
  image_url?: string;
  unit_type: string;
  min_order_qty: number;
  max_order_qty?: number;
  stock_quantity?: number;
  preparation_time?: number;
  pre_order_time?: number;
  is_available: boolean;
  is_featured: boolean;
  featured_priority?: number;
  offer_code?: string;
  offer_discount_type?: 'percentage' | 'fixed';
  offer_discount_value?: number;
  discounted_price?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  delivery_charges: number;
  service_charges: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  order_type: 'pickup' | 'delivery';
  delivery_address: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
}

export interface Offer {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  payment_mode: 'cash' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_date?: string;
  event_type?: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'other';
  guest_count?: number;
  additional_details?: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  notes?: string;
  quote_amount?: number;
  created_at: string;
  updated_at: string;
}