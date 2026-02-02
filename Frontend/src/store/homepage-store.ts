import { create } from 'zustand';
import { 
  HeroSection, 
  FeaturedMenuSection, 
  ExploreMenuSection, 
  Event, 
  Testimonial, 
  FooterSection,
  ReadyToCreateSection
} from '@/types/cms';

interface HomepageState {
  // Hero Section
  heroSection: HeroSection;
  updateHeroSection: (data: Partial<HeroSection>) => void;

  // Featured Menu Section
  featuredMenuSection: FeaturedMenuSection;
  updateFeaturedMenuSection: (data: Partial<FeaturedMenuSection>) => void;

  // Explore Menu Section
  exploreMenuSection: ExploreMenuSection;
  updateExploreMenuSection: (data: Partial<ExploreMenuSection>) => void;

  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Footer Section
  footerSection: FooterSection;
  updateFooterSection: (data: Partial<FooterSection>) => void;

  // Ready to Create Magic Section
  readyToCreateSection: ReadyToCreateSection;
  updateReadyToCreateSection: (data: Partial<ReadyToCreateSection>) => void;
}

const defaultHeroSection: HeroSection = {
  id: '1',
  title: 'SR FoodKraft Catering',
  subtitle: 'Authentic Indian cuisine for your special occasions. From weddings to corporate events, we bring traditional flavors to your celebrations.',
  background_image_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920',
  primary_button_text: 'Book Catering',
  primary_button_url: '/contact',
  secondary_button_text: 'View Menu',
  secondary_button_url: '/menu',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultFeaturedMenuSection: FeaturedMenuSection = {
  id: '1',
  title: 'Our Signature Biryanis',
  subtitle: 'Authentic Hyderabadi and traditional biryanis perfect for your events',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultExploreMenuSection: ExploreMenuSection = {
  id: '1',
  title: 'Complete Catering Menu',
  subtitle: 'From biryanis to curries, breads to desserts - everything for your perfect event',
  button_text: 'View Full Menu',
  button_url: '/menu',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Corporate Events',
    description: 'Professional catering for your business meetings and corporate gatherings',
    image_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: '2024-12-31',
    location: 'Any Location',
    price: 'Starting from ₹500 per person',
    is_active: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Wedding Catering',
    description: 'Make your special day unforgettable with our exquisite wedding catering services',
    image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: '2024-12-31',
    location: 'Any Location',
    price: 'Starting from ₹800 per person',
    is_active: true,
    display_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    client_name: 'Priya Sharma',
    client_title: 'Event Manager',
    client_company: 'TechCorp India',
    client_image_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'SR FoodKraft made our corporate event absolutely perfect. The food was exceptional and the service was outstanding.',
    rating: 5,
    is_active: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    client_name: 'Rajesh Kumar',
    client_title: 'Wedding Planner',
    client_company: 'Dream Weddings',
    client_image_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'The wedding catering was beyond our expectations. Every guest complimented the food quality and presentation.',
    rating: 5,
    is_active: true,
    display_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const defaultFooterSection: FooterSection = {
  id: '1',
  company_name: 'SR FoodKraft',
  tagline: 'Crafting exceptional culinary experiences',
  description: 'We specialize in creating memorable dining experiences for all your special occasions.',
  logo_url: '/SR logo.png',
  contact_email: 'info@srfoodkraft.com',
  contact_phone: '+91 9876543210',
  address: '123 Food Street, Culinary District, Mumbai, Maharashtra 400001',
  social_links: {
    facebook: 'https://facebook.com/srfoodkraft',
    instagram: 'https://instagram.com/srfoodkraft',
    twitter: 'https://twitter.com/srfoodkraft',
  },
  copyright_text: '© 2024 SR FoodKraft. All rights reserved.',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultReadyToCreateSection: ReadyToCreateSection = {
  id: '1',
  title: 'Ready to Plan Your Event?',
  subtitle: 'Let us create an unforgettable catering experience for your special occasion',
  description: 'From intimate family gatherings to grand wedding celebrations, we provide complete catering solutions with authentic Indian cuisine that will delight your guests.',
  primary_button_text: 'Get Quote',
  primary_button_url: '/contact',
  secondary_button_text: 'View Gallery',
  secondary_button_url: '/gallery',
  background_image_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const useHomepageStore = create<HomepageState>((set) => ({
  // Hero Section
  heroSection: defaultHeroSection,
  updateHeroSection: (data) =>
    set((state) => ({
      heroSection: {
        ...state.heroSection,
        ...data,
        updated_at: new Date().toISOString(),
      },
    })),

  // Featured Menu Section
  featuredMenuSection: defaultFeaturedMenuSection,
  updateFeaturedMenuSection: (data) =>
    set((state) => ({
      featuredMenuSection: {
        ...state.featuredMenuSection,
        ...data,
        updated_at: new Date().toISOString(),
      },
    })),

  // Explore Menu Section
  exploreMenuSection: defaultExploreMenuSection,
  updateExploreMenuSection: (data) =>
    set((state) => ({
      exploreMenuSection: {
        ...state.exploreMenuSection,
        ...data,
        updated_at: new Date().toISOString(),
      },
    })),

  // Events
  events: defaultEvents,
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...data, updated_at: new Date().toISOString() }
          : event
      ),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),

  // Testimonials
  testimonials: defaultTestimonials,
  addTestimonial: (testimonial) =>
    set((state) => ({
      testimonials: [
        ...state.testimonials,
        {
          ...testimonial,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateTestimonial: (id, data) =>
    set((state) => ({
      testimonials: state.testimonials.map((testimonial) =>
        testimonial.id === id
          ? { ...testimonial, ...data, updated_at: new Date().toISOString() }
          : testimonial
      ),
    })),
  deleteTestimonial: (id) =>
    set((state) => ({
      testimonials: state.testimonials.filter((testimonial) => testimonial.id !== id),
    })),

  // Footer Section
  footerSection: defaultFooterSection,
  updateFooterSection: (data) =>
    set((state) => ({
      footerSection: {
        ...state.footerSection,
        ...data,
        updated_at: new Date().toISOString(),
      },
    })),

  // Ready to Create Magic Section
  readyToCreateSection: defaultReadyToCreateSection,
  updateReadyToCreateSection: (data) =>
    set((state) => ({
      readyToCreateSection: {
        ...state.readyToCreateSection,
        ...data,
        updated_at: new Date().toISOString(),
      },
    })),
}));
