'use strict';
const cmsService = require('../services/cmsService');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class CMSController {
    // --- Banners ---
    async getBanners(req, res) {
        try {
            const data = await cmsService.getBanners(req.query);
            return successResponse(res, 'Banners fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createBanner(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createBanner(req.body);
            return successResponse(res, 'Banner created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateBanner(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateBanner(req.params.id, req.body);
            return successResponse(res, 'Banner updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteBanner(req, res) {
        try {
            await cmsService.deleteBanner(req.params.id);
            return successResponse(res, 'Banner deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Gallery Images ---
    async getGalleryImages(req, res) {
        try {
            const data = await cmsService.getGalleryImages(req.query);
            return successResponse(res, 'Gallery images fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createGalleryImage(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createGalleryImage(req.body);
            return successResponse(res, 'Gallery image created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateGalleryImage(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateGalleryImage(req.params.id, req.body);
            return successResponse(res, 'Gallery image updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteGalleryImage(req, res) {
        try {
            await cmsService.deleteGalleryImage(req.params.id);
            return successResponse(res, 'Gallery image deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Content Pages ---
    async getContentPages(req, res) {
        try {
            const data = await cmsService.getContentPages(req.query);
            return successResponse(res, 'Content pages fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async getContentPageByKey(req, res) {
        try {
            const data = await cmsService.getContentPageByKey(req.params.key);
            if (!data) return errorResponse(res, 'Page not found', 404);
            return successResponse(res, 'Content page fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createContentPage(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createContentPage(req.body);
            return successResponse(res, 'Content page created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateContentPage(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateContentPage(req.params.id, req.body);
            return successResponse(res, 'Content page updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteContentPage(req, res) {
        try {
            await cmsService.deleteContentPage(req.params.id);
            return successResponse(res, 'Content page deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- FAQs ---
    async getFAQs(req, res) {
        try {
            const data = await cmsService.getFAQs(req.query);
            return successResponse(res, 'FAQs fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createFAQ(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createFAQ(req.body);
            return successResponse(res, 'FAQ created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateFAQ(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateFAQ(req.params.id, req.body);
            return successResponse(res, 'FAQ updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteFAQ(req, res) {
        try {
            await cmsService.deleteFAQ(req.params.id);
            return successResponse(res, 'FAQ deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Blog Posts ---
    async getBlogPosts(req, res) {
        try {
            const data = await cmsService.getBlogPosts(req.query);
            return successResponse(res, 'Blog posts fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async getBlogPostBySlug(req, res) {
        try {
            const data = await cmsService.getBlogPostBySlug(req.params.slug);
            if (!data) return errorResponse(res, 'Blog post not found', 404);
            return successResponse(res, 'Blog post fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createBlogPost(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createBlogPost(req.body);
            return successResponse(res, 'Blog post created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateBlogPost(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateBlogPost(req.params.id, req.body);
            return successResponse(res, 'Blog post updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteBlogPost(req, res) {
        try {
            await cmsService.deleteBlogPost(req.params.id);
            return successResponse(res, 'Blog post deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Site Settings ---
    async getSiteSettings(req, res) {
        try {
            const data = await cmsService.getSiteSettings(req.query);
            return successResponse(res, 'Site settings fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateSiteSetting(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateSiteSetting(req.params.id, req.body.value);
            return successResponse(res, 'Site setting updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Product Categories ---
    async getProductCategories(req, res) {
        try {
            const data = await cmsService.getProductCategories(req.query);
            return successResponse(res, 'Product categories fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createProductCategory(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createProductCategory(req.body);
            return successResponse(res, 'Product category created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateProductCategory(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateProductCategory(req.params.id, req.body);
            return successResponse(res, 'Product category updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteProductCategory(req, res) {
        try {
            await cmsService.deleteProductCategory(req.params.id);
            return successResponse(res, 'Product category deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Product Types ---
    async getProductTypes(req, res) {
        try {
            const data = await cmsService.getProductTypes(req.query);
            return successResponse(res, 'Product types fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async createProductType(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.createProductType(req.body);
            return successResponse(res, 'Product type created successfully', data, 201);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateProductType(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
        try {
            const data = await cmsService.updateProductType(req.params.id, req.body);
            return successResponse(res, 'Product type updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async deleteProductType(req, res) {
        try {
            await cmsService.deleteProductType(req.params.id);
            return successResponse(res, 'Product type deleted successfully');
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- Homepage Hero ---
    async getHomepageHero(req, res) {
        try {
            const data = await cmsService.getHomepageHero();
            return successResponse(res, 'Homepage hero fetched successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }
    async updateHomepageHero(req, res) {
        try {
            const data = await cmsService.updateHomepageHero(req.body);
            return successResponse(res, 'Homepage hero updated successfully', data);
        } catch (error) { return errorResponse(res, error.message); }
    }

    // --- File Upload Mock ---
    async uploadFile(req, res) {
        try {
            // Since we don't have multer, we'll return a placeholder
            // In a real app, this would use req.file
            const mockUrl = `https://placehold.co/600x400?text=Uploaded+Image+${Date.now()}`;
            return successResponse(res, 'File uploaded successfully', { url: mockUrl });
        } catch (error) { return errorResponse(res, error.message); }
    }
}

module.exports = new CMSController();
