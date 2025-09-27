const settingsModel = require('../models/settingsModel');

// Create Stripe payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, paymentMethodId, currency = 'usd', orderData } = req.body;

        // Check if Stripe is enabled
        const settings = await settingsModel.getSettings();
        if (!settings?.payment?.enableStripe) {
            return res.status(400).json({
                message: "Stripe payments are currently disabled",
                error: true,
                success: false
            });
        }

        // Validate Stripe configuration
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key_here') {
            return res.status(500).json({
                message: "Stripe payment system is not properly configured",
                error: true,
                success: false
            });
        }

        // Initialize Stripe with the secret key
        const stripe = require('stripe')(stripeSecretKey);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount should already be in cents
            currency: currency,
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
        });

        if (paymentIntent.status === 'requires_action' && paymentIntent.next_action.type === 'use_stripe_sdk') {
            return res.status(200).json({
                message: "Payment requires additional authentication",
                error: false,
                success: true,
                requiresAction: true,
                clientSecret: paymentIntent.client_secret
            });
        } else if (paymentIntent.status === 'succeeded') {
            return res.status(200).json({
                message: "Payment processed successfully",
                error: false,
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency
                }
            });
        } else {
            return res.status(400).json({
                message: `Payment failed with status: ${paymentIntent.status}`,
                error: true,
                success: false
            });
        }

    } catch (error) {
        console.error('Stripe payment processing error:', error);
        
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                message: error.message || 'Payment failed due to card issue',
                error: true,
                success: false
            });
        }

        return res.status(500).json({
            message: error.message || 'Payment processing failed',
            error: true,
            success: false
        });
    }
};

// Process payment (legacy endpoint for backward compatibility)
const processPayment = async (req, res) => {
    try {
        const { paymentMethodId, amount, currency = 'usd', orderData } = req.body;

        // Check if Stripe is enabled
        const settings = await settingsModel.getSettings();
        if (!settings?.payment?.enableStripe) {
            return res.status(400).json({
                message: "Stripe payments are currently disabled",
                error: true,
                success: false
            });
        }

        // Validate Stripe configuration
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key_here') {
            return res.status(500).json({
                message: "Stripe payment system is not properly configured",
                error: true,
                success: false
            });
        }

        // Initialize Stripe with the secret key
        const stripe = require('stripe')(stripeSecretKey);

        // Create and confirm payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount should already be in cents
            currency: currency,
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
            return res.status(200).json({
                message: "Payment processed successfully",
                error: false,
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    created: paymentIntent.created
                }
            });
        } else {
            return res.status(400).json({
                message: `Payment failed with status: ${paymentIntent.status}`,
                error: true,
                success: false,
                paymentStatus: paymentIntent.status
            });
        }

    } catch (error) {
        console.error('Stripe payment processing error:', error);
        
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                message: error.message || 'Payment failed due to card issue',
                error: true,
                success: false
            });
        }

        return res.status(500).json({
            message: error.message || 'Payment processing failed',
            error: true,
            success: false
        });
    }
};

module.exports = {
    createPaymentIntent,
    processPayment
};