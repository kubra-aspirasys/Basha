'use strict';
const models = require('../models');

class CMSService {
    // Helper to get models safely to avoid circular dependency issues during startup
    get models() {
        return models;
    }

    // --- Banners ---
    async getBanners(query = {}) {
        return await this.models.Banner.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createBanner(data) { return await this.models.Banner.create(data); }
    async updateBanner(id, data) {
        const banner = await this.models.Banner.findByPk(id);
        if (!banner) throw new Error('Banner not found');
        return await banner.update(data);
    }
    async deleteBanner(id) {
        const banner = await this.models.Banner.findByPk(id);
        if (!banner) throw new Error('Banner not found');
        return await banner.destroy();
    }

    // --- Gallery Images ---
    async getGalleryImages(query = {}) {
        return await this.models.GalleryImage.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createGalleryImage(data) { return await this.models.GalleryImage.create(data); }
    async updateGalleryImage(id, data) {
        const image = await this.models.GalleryImage.findByPk(id);
        if (!image) throw new Error('Image not found');
        return await image.update(data);
    }
    async deleteGalleryImage(id) {
        const image = await this.models.GalleryImage.findByPk(id);
        if (!image) throw new Error('Image not found');
        return await image.destroy();
    }

    // --- Content Pages ---
    async getContentPages(query = {}) {
        return await this.models.ContentPage.findAll({ where: query });
    }
    async getContentPageByKey(page_key) {
        return await this.models.ContentPage.findOne({ where: { page_key } });
    }
    async createContentPage(data) { return await this.models.ContentPage.create(data); }
    async updateContentPage(id, data) {
        const page = await this.models.ContentPage.findByPk(id);
        if (!page) throw new Error('Page not found');
        return await page.update(data);
    }
    async deleteContentPage(id) {
        const page = await this.models.ContentPage.findByPk(id);
        if (!page) throw new Error('Page not found');
        return await page.destroy();
    }

    // --- FAQs ---
    async getFAQs(query = {}) {
        return await this.models.FAQ.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createFAQ(data) { return await this.models.FAQ.create(data); }
    async updateFAQ(id, data) {
        const faq = await this.models.FAQ.findByPk(id);
        if (!faq) throw new Error('FAQ not found');
        return await faq.update(data);
    }
    async deleteFAQ(id) {
        const faq = await this.models.FAQ.findByPk(id);
        if (!faq) throw new Error('FAQ not found');
        return await faq.destroy();
    }

    // --- Blog Posts ---
    async getBlogPosts(query = {}) {
        return await this.models.BlogPost.findAll({ where: query, order: [['created_at', 'DESC']] });
    }
    async getBlogPostBySlug(slug) {
        return await this.models.BlogPost.findOne({ where: { slug } });
    }
    async createBlogPost(data) { return await this.models.BlogPost.create(data); }
    async updateBlogPost(id, data) {
        const post = await this.models.BlogPost.findByPk(id);
        if (!post) throw new Error('Post not found');
        return await post.update(data);
    }
    async deleteBlogPost(id) {
        const post = await this.models.BlogPost.findByPk(id);
        if (!post) throw new Error('Post not found');
        return await post.destroy();
    }

    // --- Site Settings ---
    async getSiteSettings(query = {}) {
        return await this.models.SiteSetting.findAll({ where: query, order: [['category', 'ASC']] });
    }
    async updateSiteSetting(id, value) {
        const setting = await this.models.SiteSetting.findByPk(id);
        if (!setting) throw new Error('Setting not found');
        return await setting.update({ value });
    }
    async getSiteSettingByKey(key) {
        return await this.models.SiteSetting.findOne({ where: { key } });
    }
    async createSiteSetting(data) {
        return await this.models.SiteSetting.create(data);
    }

    // --- Product Categories (MenuCategory) ---
    async getProductCategories(query = {}) {
        return await this.models.MenuCategory.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createProductCategory(data) { return await this.models.MenuCategory.create(data); }
    async updateProductCategory(id, data) {
        const category = await this.models.MenuCategory.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.update(data);
    }
    async deleteProductCategory(id) {
        const category = await this.models.MenuCategory.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.destroy();
    }

    // --- Product Types (MenuType) ---
    async getProductTypes(query = {}) {
        return await this.models.MenuType.findAll({ where: query });
    }
    async createProductType(data) { return await this.models.MenuType.create(data); }
    async updateProductType(id, data) {
        const type = await this.models.MenuType.findByPk(id);
        if (!type) throw new Error('Type not found');
        return await type.update(data);
    }
    async deleteProductType(id) {
        const type = await this.models.MenuType.findByPk(id);
        if (!type) throw new Error('Type not found');
        return await type.destroy();
    }

    async getHomepageHero() {
        const setting = await this.models.SiteSetting.findOne({ where: { key: 'homepage_config' } });
        if (setting) return JSON.parse(setting.value);
        
        // Return default configuration if not found
        return {
            hero: {
                enabled: true,
                video_url: "/Videos/hero.mp4",
                tagline: "Spiced to Perfection, Served with Tradition!",
                logo_url: "/Images/KING OF ALL FOOD.webp",
                description: "Experience the rich taste of traditional Hyderabad cuisine with our signature BBQ kababs, wraps, and desserts.",
                button_text: "Order Now"
            },
            about: {
                enabled: true,
                image_url: "/AboutTikka.png",
                badge: "About Us",
                title_line1: "Authentic Hyderabad",
                title_line2: "Biryani & BBQ",
                description: "A savory haven for food lovers offering meticulously crafted dishes bursting with authentic Hyderabad flavors. From our signature BBQ kebabs to our aromatic biryanis, every dish tells a story of tradition and taste.",
                feature1_title: "Fast Service",
                feature1_desc: "Quick delivery within 30 minutes",
                feature2_title: "Quality Food",
                feature2_desc: "Fresh ingredients daily",
                button_text: "View Menu"
            },
            heritage: {
                enabled: true,
                title: "Hyderabad Chicken Biryani",
                video_url: "/Videos/hero.mp4",
                text_block1: "Hyderabad biryani originated from Golconda, Telangana India.",
                text_block2: "Originating in the kitchens of the Qutub Shahi Kingdom.",
                text_block3: "Hyderabad biryani is a city's signature dish.",
                charminar_image: "/charminar.webp",
                nizam_image: "/nizam.webp"
            },
            menu: {
                enabled: true,
                badge: "Our Menu",
                title: "Explore Our Delicious Menu",
                description: "Choose from our wide range of authentic Hyderabad dishes"
            },
            features: {
                enabled: true,
                list: [
                    { title: 'Fast Delivery', desc: 'Quick takeaway and delivery within 30 minutes' },
                    { title: 'Easy Ordering', desc: 'Order online or call us at 70109 33658' },
                    { title: 'Find Us', desc: 'Kaka Chandamiyan Street, Ambur' }
                ]
            },
            cta: {
                enabled: true,
                stroke_title: "Biryani @ Basha",
                tagline: "ORDER........ EAT........ REPEAT",
                button_text: "Order Now"
            }
        };
    }
    async updateHomepageHero(data) {
        const SiteSetting = this.models.SiteSetting;
        if (!SiteSetting) throw new Error('SiteSetting model not loaded');

        const [setting] = await SiteSetting.findOrCreate({
            where: { key: 'homepage_config' },
            defaults: {
                value: JSON.stringify(data),
                type: 'json',
                category: 'general',
                description: 'JSON configuration for Homepage'
            }
        });
        const updated = await setting.update({ value: JSON.stringify(data) });
        return JSON.parse(updated.value);
    }

    // --- Store Status (Stored in SiteSettings) ---
    async getStoreStatus() {
        const SiteSetting = this.models.SiteSetting;
        if (!SiteSetting) throw new Error('SiteSetting model not loaded');

        const [activeSetting] = await SiteSetting.findOrCreate({
            where: { key: 'is_store_active' },
            defaults: {
                value: 'true',
                type: 'boolean',
                category: 'system',
                description: 'Is store actively accepting orders'
            }
        });
        
        const [reasonSetting] = await SiteSetting.findOrCreate({
            where: { key: 'store_close_reason' },
            defaults: {
                value: '',
                type: 'text',
                category: 'system',
                description: 'Reason for closing the store'
            }
        });

        return { 
            is_store_active: activeSetting.value === 'true',
            close_reason: reasonSetting.value
        };
    }

    async updateStoreStatus(isActive, closeReason = '') {
        const SiteSetting = this.models.SiteSetting;
        if (!SiteSetting) throw new Error('SiteSetting model not loaded');

        const [activeSetting] = await SiteSetting.findOrCreate({
            where: { key: 'is_store_active' },
            defaults: {
                value: 'true',
                type: 'boolean',
                category: 'system',
                description: 'Is store actively accepting orders'
            }
        });
        
        const [reasonSetting] = await SiteSetting.findOrCreate({
            where: { key: 'store_close_reason' },
            defaults: {
                value: '',
                type: 'text',
                category: 'system',
                description: 'Reason for closing the store'
            }
        });

        const updatedActive = await activeSetting.update({ value: isActive ? 'true' : 'false' });
        const updatedReason = await reasonSetting.update({ value: isActive ? '' : closeReason });

        return { 
            is_store_active: updatedActive.value === 'true',
            close_reason: updatedReason.value
        };
    }
}

module.exports = new CMSService();
