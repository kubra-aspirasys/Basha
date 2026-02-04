'use strict';
const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    bannerValidator,
    galleryImageValidator,
    contentPageValidator,
    faqValidator,
    blogPostValidator,
    siteSettingValidator,
    menuCategoryValidator,
    menuTypeValidator
} = require('../validators/cmsValidator');

// Helper to define CRUD routes
// path: url segment
// controllerPrefix: plural for GET, singular for CRUD
const defineCRUD = (path, pluralPrefix, singularPrefix, validator, idParam = 'id') => {
    // Public/Customer Fetch
    router.get(`/${path}`, cmsController[`get${pluralPrefix}`]);

    // Admin Only CRUD
    router.post(`/${path}`, protect, authorize('admin'), validator, cmsController[`create${singularPrefix}`]);
    router.put(`/${path}/:${idParam}`, protect, authorize('admin'), validator, cmsController[`update${singularPrefix}`]);
    router.delete(`/${path}/:${idParam}`, protect, authorize('admin'), cmsController[`delete${singularPrefix}`]);
};

// Define routes for each CMS entity
defineCRUD('banners', 'Banners', 'Banner', bannerValidator);
defineCRUD('gallery-images', 'GalleryImages', 'GalleryImage', galleryImageValidator);
defineCRUD('faqs', 'FAQs', 'FAQ', faqValidator);
defineCRUD('blog-posts', 'BlogPosts', 'BlogPost', blogPostValidator);
defineCRUD('product-categories', 'ProductCategories', 'ProductCategory', menuCategoryValidator);
defineCRUD('product-types', 'ProductTypes', 'ProductType', menuTypeValidator);

// Special case for Content Pages (uses key)
router.get('/content-pages', cmsController.getContentPages);
router.get('/content-pages/:key', cmsController.getContentPageByKey);
router.post('/content-pages', protect, authorize('admin'), contentPageValidator, cmsController.createContentPage);
router.put('/content-pages/:id', protect, authorize('admin'), contentPageValidator, cmsController.updateContentPage);
router.delete('/content-pages/:id', protect, authorize('admin'), cmsController.deleteContentPage);

// Special case for Blog Post by Slug
router.get('/blog-posts/slug/:slug', cmsController.getBlogPostBySlug);

// Special case for Site Settings
router.get('/site-settings', cmsController.getSiteSettings);
router.put('/site-settings/:id', protect, authorize('admin'), siteSettingValidator, cmsController.updateSiteSetting);

// Homepage Hero
router.get('/homepage-hero', cmsController.getHomepageHero);
router.put('/homepage-hero', protect, authorize('admin'), cmsController.updateHomepageHero);

// File Upload
router.post('/upload', protect, authorize('admin'), cmsController.uploadFile);

module.exports = router;
