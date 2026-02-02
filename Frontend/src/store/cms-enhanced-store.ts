import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { GalleryImage, ContentPage, FAQ, BlogPost, SiteSetting, ProductCategory, ProductType } from '@/types/cms';

interface CMSEnhancedState {
  galleryImages: GalleryImage[];
  contentPages: ContentPage[];
  faqs: FAQ[];
  blogPosts: BlogPost[];
  siteSettings: SiteSetting[];
  productCategories: ProductCategory[];
  productTypes: ProductType[];
  loading: boolean;
  error: string | null;

  fetchGalleryImages: () => Promise<void>;
  addGalleryImage: (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;

  fetchContentPages: () => Promise<void>;
  updateContentPage: (id: string, page: Partial<ContentPage>) => Promise<void>;

  fetchFAQs: () => Promise<void>;
  addFAQ: (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFAQ: (id: string, faq: Partial<FAQ>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;

  fetchBlogPosts: () => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;

  fetchSiteSettings: () => Promise<void>;
  updateSiteSetting: (id: string, value: string) => Promise<void>;

  fetchProductCategories: () => Promise<void>;
  addProductCategory: (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;

  fetchProductTypes: () => Promise<void>;
  addProductType: (type: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProductType: (id: string, type: Partial<ProductType>) => Promise<void>;
  deleteProductType: (id: string) => Promise<void>;

  uploadImage: (file: File, bucket: string) => Promise<string>;
}

export const useCMSEnhancedStore = create<CMSEnhancedState>((set) => ({
  galleryImages: [],
  contentPages: [],
  faqs: [],
  blogPosts: [],
  siteSettings: [],
  productCategories: [],
  productTypes: [],
  loading: false,
  error: null,

  fetchGalleryImages: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      set({ galleryImages: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addGalleryImage: async (image) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert([image])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        galleryImages: [...state.galleryImages, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateGalleryImage: async (id, image) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(image)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        galleryImages: state.galleryImages.map((img) =>
          img.id === id ? data : img
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteGalleryImage: async (id) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        galleryImages: state.galleryImages.filter((img) => img.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchContentPages: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('page_key', { ascending: true });

      if (error) throw error;
      set({ contentPages: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateContentPage: async (id, page) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .update(page)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        contentPages: state.contentPages.map((p) => p.id === id ? data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchFAQs: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      set({ faqs: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addFAQ: async (faq) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert([faq])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        faqs: [...state.faqs, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateFAQ: async (id, faq) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update(faq)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        faqs: state.faqs.map((f) => f.id === id ? data : f),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteFAQ: async (id) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBlogPosts: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ blogPosts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBlogPost: async (post) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        blogPosts: [data, ...state.blogPosts],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateBlogPost: async (id, post) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        blogPosts: state.blogPosts.map((p) => p.id === id ? data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteBlogPost: async (id) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        blogPosts: state.blogPosts.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  uploadImage: async (file, bucket) => {
    if (!supabase) throw new Error("Supabase is not configured");
    set({ loading: true, error: null });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      set({ loading: false });
      return data.publicUrl;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSiteSettings: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      set({ siteSettings: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSiteSetting: async (id, value) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        siteSettings: state.siteSettings.map((s) => s.id === id ? data : s),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProductCategories: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      set({ productCategories: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProductCategory: async (category) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        productCategories: [...state.productCategories, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProductCategory: async (id, category) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        productCategories: state.productCategories.map((c) => c.id === id ? data : c),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteProductCategory: async (id) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        productCategories: state.productCategories.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProductTypes: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      set({ productTypes: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProductType: async (type) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_types')
        .insert([type])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        productTypes: [...state.productTypes, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProductType: async (id, type) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_types')
        .update(type)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        productTypes: state.productTypes.map((t) => t.id === id ? data : t),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteProductType: async (id) => {
    if (!supabase) return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('product_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        productTypes: state.productTypes.filter((t) => t.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
