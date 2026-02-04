'use strict';
const { body } = require('express-validator');

/**
 * Common display order validator
 */
const displayOrderValidator = body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a positive integer');
const isActiveValidator = body('is_active').optional().isBoolean().withMessage('is_active must be a boolean');

const bannerValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('image_url').notEmpty().withMessage('Image URL is required'),
    body('link_url').optional().isString(),
    body('link_type').optional().isIn(['none', 'internal', 'external']),
    displayOrderValidator,
    isActiveValidator
];

const galleryImageValidator = [
    body('title').optional().isString(),
    body('image_url').notEmpty().withMessage('Image URL is required'),
    body('category').optional().isString(),
    displayOrderValidator,
    isActiveValidator
];

const contentPageValidator = [
    body('page_key').notEmpty().withMessage('Page key is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('is_published').optional().isBoolean(),
];

const faqValidator = [
    body('question').notEmpty().withMessage('Question is required'),
    body('answer').notEmpty().withMessage('Answer is required'),
    body('category').optional().isString(),
    displayOrderValidator,
    isActiveValidator
];

const blogPostValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('is_published').optional().isBoolean(),
];

const siteSettingValidator = [
    body('value').notEmpty().withMessage('Value is required'),
];

const menuCategoryValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    displayOrderValidator,
    isActiveValidator
];

const menuTypeValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
];

module.exports = {
    bannerValidator,
    galleryImageValidator,
    contentPageValidator,
    faqValidator,
    blogPostValidator,
    siteSettingValidator,
    menuCategoryValidator,
    menuTypeValidator
};
