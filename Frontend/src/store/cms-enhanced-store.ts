import { create } from 'zustand';
import api from '@/lib/api';
import { GalleryImage, ContentPage, FAQ, BlogPost, SiteSetting, ProductCategory, ProductType } from '@/types/cms';

interface CMSEnhancedState {
  galleryImages: GalleryImage[];
  contentPages: ContentPage[];
  faqs: FAQ[];
  blogPosts: BlogPost[];
  siteSettings: SiteSetting[];
  productCategories: ProductCategory[];
  productTypes: ProductType[];
  homepageHero: any | null;
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

  fetchHomepageHero: () => Promise<void>;
  updateHomepageHero: (data: any) => Promise<void>;

  uploadImage: (file: File, bucket: string) => Promise<string>;
  getSiteSettingByKey: (key: string) => SiteSetting | undefined;
}

export const useCMSEnhancedStore = create<CMSEnhancedState>((set) => ({
  galleryImages: [],
  contentPages: [],
  faqs: [],
  blogPosts: [],
  siteSettings: [],
  productCategories: [],
  productTypes: [],
  homepageHero: null,
  loading: false,
  error: null,

  fetchGalleryImages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/gallery-images');
      set({ galleryImages: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addGalleryImage: async (image) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/cms/gallery-images', image);
      set((state) => ({
        galleryImages: [...state.galleryImages, response.data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateGalleryImage: async (id, image) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/gallery-images/${id}`, image);
      set((state) => ({
        galleryImages: state.galleryImages.map((img) =>
          img.id === id ? response.data.data : img
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  deleteGalleryImage: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cms/gallery-images/${id}`);
      set((state) => ({
        galleryImages: state.galleryImages.filter((img) => img.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchContentPages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/content-pages');
      set({ contentPages: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateContentPage: async (id, page) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/content-pages/${id}`, page);
      set((state) => ({
        contentPages: state.contentPages.map((p) => p.id === id ? response.data.data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchFAQs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/faqs');
      set({ faqs: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addFAQ: async (faq) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/cms/faqs', faq);
      set((state) => ({
        faqs: [...state.faqs, response.data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateFAQ: async (id, faq) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/faqs/${id}`, faq);
      set((state) => ({
        faqs: state.faqs.map((f) => f.id === id ? response.data.data : f),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  deleteFAQ: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cms/faqs/${id}`);
      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchBlogPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/blog-posts');
      set({ blogPosts: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addBlogPost: async (post) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/cms/blog-posts', post);
      set((state) => ({
        blogPosts: [response.data.data, ...state.blogPosts],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateBlogPost: async (id, post) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/blog-posts/${id}`, post);
      set((state) => ({
        blogPosts: state.blogPosts.map((p) => p.id === id ? response.data.data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  deleteBlogPost: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cms/blog-posts/${id}`);
      set((state) => ({
        blogPosts: state.blogPosts.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  uploadImage: async (file, bucket) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('bucket', bucket);

      const response = await api.post('/cms/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      set({ loading: false });
      return response.data.data.url;
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchSiteSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/site-settings');
      set({ siteSettings: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateSiteSetting: async (id, value) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/site-settings/${id}`, { value });
      set((state) => ({
        siteSettings: state.siteSettings.map((s) => s.id === id ? response.data.data : s),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchProductCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/product-categories');
      set({ productCategories: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addProductCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/cms/product-categories', category);
      set((state) => ({
        productCategories: [...state.productCategories, response.data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateProductCategory: async (id, category) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/product-categories/${id}`, category);
      set((state) => ({
        productCategories: state.productCategories.map((c) => c.id === id ? response.data.data : c),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  deleteProductCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cms/product-categories/${id}`);
      set((state) => ({
        productCategories: state.productCategories.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchProductTypes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/product-types');
      set({ productTypes: response.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addProductType: async (type) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/cms/product-types', type);
      set((state) => ({
        productTypes: [...state.productTypes, response.data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateProductType: async (id, type) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/cms/product-types/${id}`, type);
      set((state) => ({
        productTypes: state.productTypes.map((t) => t.id === id ? response.data.data : t),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  deleteProductType: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cms/product-types/${id}`);
      set((state) => ({
        productTypes: state.productTypes.filter((t) => t.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchHomepageHero: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cms/homepage-hero');
      set({ homepageHero: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateHomepageHero: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/cms/homepage-hero', data);
      set({ homepageHero: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  getSiteSettingByKey: (key: string) => {
    const { siteSettings } = useCMSEnhancedStore.getState();
    return siteSettings.find(s => s.key === key);
  },
}));
