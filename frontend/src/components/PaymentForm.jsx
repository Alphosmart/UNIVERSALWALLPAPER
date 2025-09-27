import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';

// Stripe integration component with dynamic loading
const StripePaymentForm = ({ onPaymentSuccess, orderData, totalAmount }) => {
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);

    useEffect(() => {
        const loadStripe = async () => {
            try {
                const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
                
                if (!stripeKey || stripeKey === 'pk_test_demo_key') {
                    console.warn('Stripe publishable key not configured');
                    return;
                }

                // Dynamic import of Stripe modules
                const [{ loadStripe: loadStripeJs }, { Elements, CardElement, useStripe, useElements }] = await Promise.all([
                    import('@stripe/stripe-js'),
                    import('@stripe/react-stripe-js')
                ]);

                const stripe = await loadStripeJs(stripeKey);
                
                if (stripe) {
                    setStripeElements({ Elements, CardElement, useStripe, useElements, stripe });
                    setIsStripeLoaded(true);
                } else {
                    throw new Error('Failed to initialize Stripe');
                }
            } catch (error) {
                console.error('Error loading Stripe:', error);
                setPaymentError('Payment system temporarily unavailable. Please try again later.');
            }
        };

        loadStripe();
    }, []);

    // Inner component that uses Stripe hooks
    const StripeCardForm = () => {
        const { useStripe, useElements, CardElement } = stripeElements;
        const stripe = useStripe();
        const elements = useElements();

        const handleSubmit = async (event) => {
            event.preventDefault();
            
            if (!stripe || !elements) {
                setPaymentError('Payment system not ready. Please try again.');
                return;
            }

            setIsProcessing(true);
            setPaymentError(null);

            try {
                const card = elements.getElement(CardElement);
                
                const { error, paymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: card,
                    billing_details: {
                        name: orderData.buyerDetails?.name || 'Customer',
                        email: orderData.buyerDetails?.email || '',
                        address: {
                            line1: orderData.shippingAddress?.address || '',
                            city: orderData.shippingAddress?.city || '',
                            state: orderData.shippingAddress?.state || '',
                            postal_code: orderData.shippingAddress?.postalCode || '',
                            country: orderData.shippingAddress?.country || ''
                        }
                    }
                });

                if (error) {
                    setPaymentError(error.message);
                    return;
                }

                // Process payment with your backend
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/process-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        paymentMethodId: paymentMethod.id,
                        amount: Math.round(totalAmount * 100), // Convert to cents
                        currency: 'usd',
                        orderData
                    })
                });

                const result = await response.json();

                if (result.success) {
                    toast.success('Payment processed successfully!');
                    onPaymentSuccess(result.paymentIntent);
                } else {
                    setPaymentError(result.message || 'Payment failed. Please try again.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                setPaymentError('Payment failed. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                        }}
                    />
                </div>
                
                {paymentError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {paymentError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                    {isProcessing ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <FaCreditCard />
                            Pay ${totalAmount.toFixed(2)}
                        </>
                    )}
                </button>
            </form>
        );
    };

    if (!isStripeLoaded) {
        return (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
                <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading payment system...</p>
            </div>
        );
    }

    if (paymentError && !isStripeLoaded) {
        return (
            <div className="bg-red-50 p-6 rounded-lg text-center">
                <div className="text-red-600 mb-4">
                    <FaCreditCard className="text-3xl mx-auto mb-2" />
                    <h3 className="font-semibold">Payment System Unavailable</h3>
                </div>
                <p className="text-red-600 text-sm mb-4">{paymentError}</p>
                <p className="text-gray-600 text-sm">
                    Please try refreshing the page or contact support if the issue persists.
                </p>
            </div>
        );
    }

    const { Elements, stripe } = stripeElements;

    return (
        <Elements stripe={stripe}>
            <StripeCardForm />
        </Elements>
    );
};

// Fallback payment form for when Stripe is not available
const FallbackPaymentForm = ({ totalAmount }) => {
    return (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="text-center">
                <FaCreditCard className="text-3xl text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold text-yellow-800 mb-2">Credit Card Payment</h3>
                <p className="text-yellow-700 text-sm mb-4">
                    Credit card processing is currently being configured.
                </p>
                <div className="bg-white p-4 rounded border">
                    <p className="font-semibold text-gray-800">Order Total: ${totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Please contact us to complete your payment or choose an alternative payment method.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Main component that decides which payment form to show
const PaymentForm = ({ onPaymentSuccess, orderData, totalAmount, paymentMethod }) => {
    const hasStripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && 
                        process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY !== 'pk_test_demo_key';

    if (paymentMethod === 'stripe') {
        if (hasStripeKey) {
            return (
                <StripePaymentForm 
                    onPaymentSuccess={onPaymentSuccess}
                    orderData={orderData}
                    totalAmount={totalAmount}
                />
            );
        } else {
            return <FallbackPaymentForm totalAmount={totalAmount} />;
        }
    }

    // For other payment methods, return null or other payment forms
    return null;
};

export default PaymentForm;