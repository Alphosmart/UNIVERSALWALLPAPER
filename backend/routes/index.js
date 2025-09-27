const express = require('express');

const router = express.Router();

const userSignUpController = require('../controller/userSignUp');
const userSignInController = require('../controller/userSignin');
const userDetailsController = require('../controller/userDetails');
const updateProfile = require('../controller/updateProfile');
const authToken = require('../middleware/authToken');
const userLogout = require('../controller/userLogout');
const { checkDatabaseConnection, handleDatabaseError } = require('../middleware/databaseMiddleware');
const { checkMaintenanceMode } = require('../middleware/maintenanceMiddleware');
const { getMaintenanceStatus } = require('../controller/maintenanceController');
const getProductController = require('../controller/getProduct');
const getSingleProductController = require('../controller/getSingleProduct');
const addProductController = require('../controller/addProduct');
const buyProductController = require('../controller/buyProduct');
const buyMultipleProductsController = require('../controller/buyMultipleProducts');
const getUserProductsController = require('../controller/getUserProducts');
const getUserOrdersController = require('../controller/getUserOrders');
const updateProductController = require('../controller/updateProduct');
const deleteProductController = require('../controller/deleteProduct');
const updateOrderStatusController = require('../controller/updateOrderStatus');
const { 
    getAllUsers, 
    updateUserRole, 
    getAllProductsAdmin, 
    deleteProductAdmin, 
    updateProductStatus, 
    getDashboardStats,
    // getAllShippingCompanies, // Removed - single company model
    // updateShippingCompanyStatus, // Removed - single company model
    setSellerSuspension,
    promoteToAdmin,
    grantProductPermissions,
    getAllStaff,
    getStaffUploadStats,
    promoteToVerifiedSeller
} = require('../controller/adminController');
const createAdminUser = require('../controller/createAdminUser');
const {
    getSiteContent,
    updateSiteContent,
    getAllSiteContent,
    resetSiteContent
} = require('../controller/siteContentController');
const {
    forgotPasswordController,
    verifyResetTokenController,
    resetPasswordController
} = require('../controller/forgotPassword');
const {
    smartSearch,
    getSearchSuggestions,
    getPopularSearches,
    getSearchFilters
} = require('../controller/smartSearchController');
const {
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart
} = require('../controller/cartController');
const {
    applyToBeSeller,
    uploadVerificationDocument,
    getSellerApplications,
    getPendingSellerApplications,
    updateSellerStatus,
    reviewSellerApplication,
    updateProfileForSeller,
    checkSellerEligibility,
    getSellerPaymentDetails,
    updateSellerPaymentDetails,
    uploadSellerDocument,
    getSellerApplicationStatus
} = require('../controller/sellerController');
const {
    getSellerOrders,
    updateSellerOrderStatus,
    getSellerOrderStats
} = require('../controller/sellerOrdersController');
// Shipping company functionality removed - single company model
// const {
//     registerShippingCompany,
//     getShippingCompanyProfile,
//     updateShippingCompanyProfile,
//     getAvailableOrders,
//     submitShippingQuote,
//     getMyQuotes,
//     getShippingCompanyStats,
//     getOrderShippingQuotes,
//     selectShippingQuote
// } = require('../controller/shippingCompanyController');
const {
    getAdminSettings,
    updateAdminSettings
} = require('../controller/settingsController');
const {
    getUserPreferences,
    updateUserPreferences
} = require('../controller/userPreferences');
const {
    createDatabaseBackup,
    getBackupList,
    getBackupDetails,
    restoreFromBackup,
    deleteBackup,
    getBackupStatistics
} = require('../controller/backupController');
const emailTemplateRoutes = require('./emailTemplateRoutes');
// Shipping controller functionality removed - single company model
// const {
//     getShippingSettings,
//     updateGlobalShippingSettings,
//     createShippingZone,
//     updateShippingZone,
//     deleteShippingZone,
//     calculateShippingCost,
//     getShippingMethods,
//     getShippingInfo
// } = require('../controller/shippingController');
const {
    getBanners,
    getAllBannersAdmin,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    updateBannersOrder
} = require('../controller/bannerController');
const {
    getAvailablePaymentMethods,
    getSellerPaymentPreferences,
    updateSellerPaymentPreferences
} = require('../controller/paymentMethodController');
const {
    createPaymentIntent,
    processPayment
} = require('../controller/stripePaymentController');
const {
    getOrderTracking,
    getBuyerOrdersWithTracking,
    updateOrderTracking,
    trackByTrackingNumber
} = require('../controller/orderTrackingController');

// Social features controller for real database
const {
    likeProduct,
    rateProduct,
    addReview,
    getProductReviews,
    shareProduct,
    getProductStats,
    likeReview
} = require('../controller/socialFeaturesController');

// Enhanced reviews controller
const {
    addEnhancedReview,
    getEnhancedReviews,
    markReviewHelpful,
    reportReview,
    getReviewStatistics
} = require('../controller/enhancedReviewsController');

// Contact message controller
const {
    submitContactMessage,
    getContactMessages,
    updateContactMessageStatus,
    deleteContactMessage,
    getContactMessage
} = require('../controller/contactMessageController');
// const resetAdminPassword = require('../controller/resetAdminPassword');

// User authentication routes
router.post('/signup', checkDatabaseConnection, userSignUpController);
router.post('/signin', checkDatabaseConnection, userSignInController);
router.get('/user-details', checkDatabaseConnection, authToken, userDetailsController);
// Profile routes - Protect during maintenance
router.put('/update-profile', checkMaintenanceMode, checkDatabaseConnection, authToken, updateProfile);
router.get('/user-preferences', checkMaintenanceMode, checkDatabaseConnection, authToken, getUserPreferences);
router.put('/user-preferences', checkMaintenanceMode, checkDatabaseConnection, authToken, updateUserPreferences);
router.get('/userLogout', userLogout);

// Maintenance mode status (public endpoint)
router.get('/maintenance-status', getMaintenanceStatus);

// Password reset routes
router.post('/forgot-password', forgotPasswordController);
router.get('/verify-reset-token', verifyResetTokenController);
router.post('/reset-password', resetPasswordController);

// Product routes
router.get('/get-product', checkMaintenanceMode, getProductController);
router.get('/product/:productId', checkMaintenanceMode, getSingleProductController);
router.post('/add-product', checkMaintenanceMode, authToken, addProductController);
router.get('/user-products', checkMaintenanceMode, authToken, getUserProductsController);
router.put('/update-product/:productId', checkMaintenanceMode, authToken, updateProductController);
router.delete('/delete-product/:productId', checkMaintenanceMode, authToken, deleteProductController);

// Social features routes
router.post('/products/:productId/like', checkMaintenanceMode, authToken, likeProduct);
router.post('/products/:productId/rate', checkMaintenanceMode, authToken, rateProduct);
router.post('/products/:productId/review', checkMaintenanceMode, authToken, addReview);
router.get('/products/:productId/reviews', checkMaintenanceMode, getProductReviews);
router.post('/products/:productId/review/:reviewId/like', checkMaintenanceMode, authToken, likeReview);
router.post('/products/:productId/share', checkMaintenanceMode, authToken, shareProduct);
router.get('/products/:productId/stats', checkMaintenanceMode, getProductStats);

// Enhanced review routes
router.post('/products/:productId/enhanced-review', checkMaintenanceMode, authToken, addEnhancedReview);
router.get('/products/:productId/enhanced-reviews', checkMaintenanceMode, getEnhancedReviews);
router.post('/products/:productId/review/:reviewId/helpful', checkMaintenanceMode, authToken, markReviewHelpful);
router.post('/products/:productId/review/:reviewId/report', checkMaintenanceMode, authToken, reportReview);
router.get('/products/:productId/review-statistics', checkMaintenanceMode, getReviewStatistics);

// Order/Purchase routes
router.post('/buy-product', checkMaintenanceMode, authToken, buyProductController);
router.post('/buy-multiple-products', checkMaintenanceMode, authToken, buyMultipleProductsController);
router.get('/user-orders', checkMaintenanceMode, authToken, getUserOrdersController);
router.put('/update-order-status/:orderId', checkMaintenanceMode, authToken, updateOrderStatusController);

// Cart routes
router.get('/cart', checkMaintenanceMode, authToken, getUserCart);
router.post('/cart/add', checkMaintenanceMode, authToken, addToCart);
router.put('/cart/update', checkMaintenanceMode, authToken, updateCartItem);
router.delete('/cart/remove/:productId', checkMaintenanceMode, authToken, removeFromCart);
router.delete('/cart/clear', checkMaintenanceMode, authToken, clearCart);
router.post('/cart/sync', checkMaintenanceMode, authToken, syncCart);

// Admin routes
router.get('/admin/all-users', authToken, getAllUsers);
router.put('/admin/update-user-role/:userId', authToken, updateUserRole);
router.get('/admin/all-products', authToken, getAllProductsAdmin);
router.delete('/admin/delete-product/:productId', authToken, deleteProductAdmin);
router.put('/admin/update-product-status/:productId', authToken, updateProductStatus);
router.get('/admin/dashboard-stats', authToken, getDashboardStats);
router.put('/admin/seller-suspension/:userId', authToken, setSellerSuspension);

// Staff management routes
router.post('/admin/promote-to-admin', authToken, promoteToAdmin);
router.put('/admin/grant-permissions', authToken, grantProductPermissions);
router.get('/admin/staff', authToken, getAllStaff);
router.get('/admin/staff/upload-stats', authToken, getStaffUploadStats);
router.post('/admin/promote-to-seller', authToken, promoteToVerifiedSeller);
// Admin seller application routes - DISABLED: Single company seller model  
// router.get('/admin/seller-applications', authToken, getSellerApplications);
// router.get('/admin/pending-seller-applications', authToken, getPendingSellerApplications);
// router.put('/admin/update-seller-status/:userId', authToken, updateSellerStatus);
// router.put('/admin/review-seller-application/:userId', authToken, reviewSellerApplication);
router.get('/admin/settings', authToken, getAdminSettings);
router.put('/admin/settings', authToken, updateAdminSettings);

// Admin shipping company routes - REMOVED (single company model)
// router.get('/admin/shipping-companies', authToken, getAllShippingCompanies);
// router.put('/admin/shipping-companies', authToken, updateShippingCompanyStatus);

// Contact message routes - Block during maintenance (except admin routes)
router.post('/contact', checkMaintenanceMode, submitContactMessage);
router.get('/admin/contact-messages', authToken, getContactMessages);
router.get('/admin/contact-messages/:messageId', authToken, getContactMessage);
router.put('/admin/contact-messages/:messageId/status', authToken, updateContactMessageStatus);
router.delete('/admin/contact-messages/:messageId', authToken, deleteContactMessage);

// Database backup routes (admin only)
router.post('/admin/backup/create', authToken, createDatabaseBackup);
router.get('/admin/backup/list', authToken, getBackupList);
router.get('/admin/backup/stats', authToken, getBackupStatistics);
router.get('/admin/backup/:backupId', authToken, getBackupDetails);
router.post('/admin/backup/:backupId/restore', authToken, restoreFromBackup);
router.delete('/admin/backup/:backupId', authToken, deleteBackup);

// Seller routes
// Seller application routes - DISABLED: Single company seller model
// router.post('/seller/apply', checkMaintenanceMode, authToken, applyToBeSeller);
// router.get('/seller/application-status', checkMaintenanceMode, authToken, getSellerApplicationStatus);
// router.post('/seller/upload-document', checkMaintenanceMode, authToken, uploadVerificationDocument);
// router.post('/upload-verification-document', checkMaintenanceMode, authToken, uploadVerificationDocument);
// router.put('/seller/update-profile', checkMaintenanceMode, authToken, updateProfileForSeller);
// router.get('/seller/check-eligibility', checkMaintenanceMode, authToken, checkSellerEligibility);

// Seller payment management routes - Admin only
router.get('/seller-payment-details', checkMaintenanceMode, authToken, getSellerPaymentDetails);
router.put('/seller-payment-details', checkMaintenanceMode, authToken, updateSellerPaymentDetails);
router.post('/seller-document-upload', checkMaintenanceMode, authToken, uploadSellerDocument);

// Seller order management routes
router.get('/seller/orders', authToken, getSellerOrders);
router.get('/seller/order-stats', authToken, getSellerOrderStats);
router.put('/seller/orders/:orderId/status', authToken, updateSellerOrderStatus);

// Shipping routes
// Shipping routes removed - single company model
// Admin shipping management
// router.get('/admin/shipping/settings', authToken, getShippingSettings);
// router.put('/admin/shipping/global', authToken, updateGlobalShippingSettings);
// router.post('/admin/shipping/zones', authToken, createShippingZone);
// router.put('/admin/shipping/zones/:zoneId', authToken, updateShippingZone);
// router.delete('/admin/shipping/zones/:zoneId', authToken, deleteShippingZone);

// Public shipping endpoints - Protect during maintenance
// router.post('/shipping/calculate', checkMaintenanceMode, calculateShippingCost);
// router.get('/shipping/methods/:country', checkMaintenanceMode, getShippingMethods);
// router.get('/shipping/info', checkMaintenanceMode, getShippingInfo);

// Banner routes (public) - Allow during maintenance for basic site info
router.get('/banners', getBanners);

// Public site content route (for frontend to fetch content without auth) - Allow during maintenance
router.get('/site-content', getSiteContent);
router.get('/site-content/:section', getSiteContent);

// Admin banner routes
router.get('/admin/banners', authToken, getAllBannersAdmin);
router.post('/admin/banners', authToken, addBanner);
router.put('/admin/banners/:bannerId', authToken, updateBanner);

// Site content management routes
router.get('/admin/site-content', authToken, getAllSiteContent);
router.get('/admin/site-content/:section', authToken, getSiteContent);
router.put('/admin/site-content', authToken, updateSiteContent);
router.delete('/admin/site-content/reset', authToken, resetSiteContent);
router.delete('/admin/banners/:bannerId', authToken, deleteBanner);
router.put('/admin/banners/:bannerId/toggle', authToken, toggleBannerStatus);
router.put('/admin/banners/order', authToken, updateBannersOrder);

// Payment method routes - Block during maintenance - Admin only for payment preferences
router.post('/payment-methods/available', checkMaintenanceMode, getAvailablePaymentMethods);
router.get('/seller/payment-preferences/:sellerId', checkMaintenanceMode, authToken, getSellerPaymentPreferences);
router.put('/seller/payment-preferences', checkMaintenanceMode, authToken, updateSellerPaymentPreferences);

// Stripe payment processing routes
router.post('/create-payment-intent', checkMaintenanceMode, authToken, createPaymentIntent);
router.post('/process-payment', checkMaintenanceMode, authToken, processPayment);

// Order tracking routes
router.get('/orders/:orderId/tracking', checkMaintenanceMode, authToken, getOrderTracking);
router.get('/buyer/orders/tracking', checkMaintenanceMode, authToken, getBuyerOrdersWithTracking);
router.put('/seller/orders/:orderId/tracking', checkMaintenanceMode, authToken, updateOrderTracking);
router.get('/track/:trackingNumber', checkMaintenanceMode, trackByTrackingNumber); // Public endpoint

// Shipping Company Routes - REMOVED (single company model)
// router.post('/shipping-company/register', checkMaintenanceMode, checkDatabaseConnection, registerShippingCompany);
// router.get('/shipping-company/profile', checkMaintenanceMode, authToken, getShippingCompanyProfile);
// router.put('/shipping-company/profile', checkMaintenanceMode, authToken, updateShippingCompanyProfile);
// router.get('/shipping-company/available-orders', checkMaintenanceMode, authToken, getAvailableOrders);
// router.post('/shipping-company/orders/:orderId/quote', checkMaintenanceMode, authToken, submitShippingQuote);
// router.get('/shipping-company/quotes', checkMaintenanceMode, authToken, getMyQuotes);
// router.get('/shipping-company/stats', checkMaintenanceMode, authToken, getShippingCompanyStats);

// Order shipping management (for sellers) - REMOVED (single company model)
// router.get('/orders/:orderId/shipping-quotes', checkMaintenanceMode, authToken, getOrderShippingQuotes);
// router.post('/orders/:orderId/shipping', checkMaintenanceMode, authToken, selectShippingQuote);

// Development route to create admin user
router.get('/create-admin', createAdminUser);
// router.post('/reset-admin-password', resetAdminPassword);

// Email Template Management Routes
router.use('/admin/email', emailTemplateRoutes);

// Advanced Search Routes
router.get('/search/smart', checkMaintenanceMode, smartSearch);
router.get('/search/suggestions', checkMaintenanceMode, getSearchSuggestions);
router.get('/search/popular', checkMaintenanceMode, getPopularSearches);
router.get('/search/filters', checkMaintenanceMode, getSearchFilters);

module.exports = router;