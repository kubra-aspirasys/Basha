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

    // --- Homepage Config (Stored in SiteSettings) ---
    async getHomepageHero() {
        const setting = await this.models.SiteSetting.findOne({ where: { key: 'homepage_config' } });
        return setting ? JSON.parse(setting.value) : null;
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
}

module.exports = new CMSService();
