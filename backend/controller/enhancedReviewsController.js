const Product = require('../models/productModel');
const User = require('../models/userModel');

// Add or update a review with enhanced features
async function addEnhancedReview(req, res) {
    try {
        const { productId } = req.params;
        const { review, rating, title, photos } = req.body;
        const userId = req.userId;

        if (!review || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Review text and rating (1-5) are required",
                error: true,
                success: false
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Check if user already reviewed the product
        const existingReviewIndex = product.reviews.findIndex(r => r.user.toString() === userId);
        
        const reviewData = {
            user: userId,
            name: user.name,
            rating: rating,
            comment: review,
            title: title || '',
            photos: photos || [],
            verified: false, // This could be set based on purchase history
            helpfulVotes: {
                helpful: [],
                notHelpful: []
            }
        };

        if (existingReviewIndex !== -1) {
            // Update existing review
            product.reviews[existingReviewIndex] = {
                ...product.reviews[existingReviewIndex],
                ...reviewData,
                createdAt: new Date()
            };
        } else {
            // Add new review
            product.reviews.push(reviewData);
        }

        await product.save();

        res.json({
            message: "Review added successfully",
            error: false,
            success: true,
            data: {
                productId,
                totalReviews: product.reviews.length
            }
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

// Get enhanced reviews with filtering and sorting
async function getEnhancedReviews(req, res) {
    try {
        const { productId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sort = 'newest',
            ratings,
            verified,
            withPhotos
        } = req.query;

        const product = await Product.findById(productId)
            .populate('reviews.user', 'name')
            .select('reviews');

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        let filteredReviews = [...product.reviews];

        // Apply filters
        if (ratings) {
            const ratingFilter = Array.isArray(ratings) ? ratings : [ratings];
            filteredReviews = filteredReviews.filter(review => 
                ratingFilter.includes(review.rating.toString())
            );
        }

        if (verified === 'true') {
            filteredReviews = filteredReviews.filter(review => review.verified);
        }

        if (withPhotos === 'true') {
            filteredReviews = filteredReviews.filter(review => 
                review.photos && review.photos.length > 0
            );
        }

        // Apply sorting
        switch (sort) {
            case 'newest':
                filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filteredReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'highest':
                filteredReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filteredReviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'helpful':
                filteredReviews.sort((a, b) => 
                    (b.helpfulVotes?.helpful?.length || 0) - (a.helpfulVotes?.helpful?.length || 0)
                );
                break;
            default:
                filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

        // Calculate stats
        const stats = {
            totalReviews: product.reviews.length,
            filteredCount: filteredReviews.length,
            averageRating: product.reviews.length > 0 
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
                : 0,
            ratingDistribution: {
                1: product.reviews.filter(r => r.rating === 1).length,
                2: product.reviews.filter(r => r.rating === 2).length,
                3: product.reviews.filter(r => r.rating === 3).length,
                4: product.reviews.filter(r => r.rating === 4).length,
                5: product.reviews.filter(r => r.rating === 5).length
            }
        };

        res.json({
            message: "Reviews retrieved successfully",
            error: false,
            success: true,
            data: {
                reviews: paginatedReviews,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(filteredReviews.length / limit),
                    totalItems: filteredReviews.length,
                    hasNextPage: endIndex < filteredReviews.length,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

// Mark review as helpful or not helpful
async function markReviewHelpful(req, res) {
    try {
        const { productId, reviewId } = req.params;
        const { helpful } = req.body;
        const userId = req.userId;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Remove user from both arrays first
        review.helpfulVotes.helpful = review.helpfulVotes.helpful.filter(id => id.toString() !== userId);
        review.helpfulVotes.notHelpful = review.helpfulVotes.notHelpful.filter(id => id.toString() !== userId);

        // Add to appropriate array
        if (helpful) {
            review.helpfulVotes.helpful.push(userId);
        } else {
            review.helpfulVotes.notHelpful.push(userId);
        }

        await product.save();

        res.json({
            message: "Review marked successfully",
            error: false,
            success: true,
            data: {
                helpfulVotes: {
                    helpful: review.helpfulVotes.helpful,
                    notHelpful: review.helpfulVotes.notHelpful
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

// Report a review
async function reportReview(req, res) {
    try {
        const { productId, reviewId } = req.params;
        const { reason } = req.body;
        const userId = req.userId;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                message: "Report reason is required",
                error: true,
                success: false
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Check if user already reported this review
        const existingReport = review.reported.find(report => report.user.toString() === userId);
        if (existingReport) {
            return res.status(400).json({
                message: "You have already reported this review",
                error: true,
                success: false
            });
        }

        // Add report
        review.reported.push({
            user: userId,
            reason: reason.trim(),
            date: new Date()
        });

        await product.save();

        res.json({
            message: "Review reported successfully",
            error: false,
            success: true,
            data: {
                reportCount: review.reported.length
            }
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

// Get review statistics for admin
async function getReviewStatistics(req, res) {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).select('reviews');
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        const reviews = product.reviews;
        const totalReviews = reviews.length;
        
        if (totalReviews === 0) {
            return res.json({
                message: "No reviews found",
                error: false,
                success: true,
                data: {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    verifiedReviews: 0,
                    reviewsWithPhotos: 0,
                    reportedReviews: 0
                }
            });
        }

        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        
        const ratingDistribution = {
            1: reviews.filter(r => r.rating === 1).length,
            2: reviews.filter(r => r.rating === 2).length,
            3: reviews.filter(r => r.rating === 3).length,
            4: reviews.filter(r => r.rating === 4).length,
            5: reviews.filter(r => r.rating === 5).length
        };

        const verifiedReviews = reviews.filter(r => r.verified).length;
        const reviewsWithPhotos = reviews.filter(r => r.photos && r.photos.length > 0).length;
        const reportedReviews = reviews.filter(r => r.reported && r.reported.length > 0).length;

        const helpfulnessStats = reviews.map(review => ({
            reviewId: review._id,
            helpfulVotes: review.helpfulVotes?.helpful?.length || 0,
            notHelpfulVotes: review.helpfulVotes?.notHelpful?.length || 0,
            netHelpfulness: (review.helpfulVotes?.helpful?.length || 0) - (review.helpfulVotes?.notHelpful?.length || 0)
        }));

        res.json({
            message: "Review statistics retrieved successfully",
            error: false,
            success: true,
            data: {
                totalReviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingDistribution,
                verifiedReviews,
                reviewsWithPhotos,
                reportedReviews,
                helpfulnessStats
            }
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = {
    addEnhancedReview,
    getEnhancedReviews,
    markReviewHelpful,
    reportReview,
    getReviewStatistics
};