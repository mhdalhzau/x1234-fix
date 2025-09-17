import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import developmentConfig from '../config/development';

// Load Stripe public key from config
const stripePromise = loadStripe(developmentConfig.STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  planId: string;
  onSuccess: (paymentIntentId?: string) => void;
}

function CheckoutForm({ planId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, activate subscription
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment processing incomplete');
      }
    } catch (err) {
      setError('Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      navigate('/subscriptions/plans');
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post(
          '/api/subscriptions/create-payment-intent',
          { planId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClientSecret(response.data.clientSecret);
        setPlanInfo({
          name: response.data.planName,
          amount: response.data.amount,
          currency: response.data.currency,
        });
      } catch (error) {
        console.error('Payment intent creation failed:', error);
        navigate('/subscriptions/plans');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [planId, navigate]);

  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        '/api/subscriptions/subscribe',
        { 
          planId,
          paymentIntentId 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/dashboard?subscription=success');
    } catch (error) {
      console.error('Subscription creation failed:', error);
      setError('Failed to activate subscription. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Setup Failed</h2>
          <p className="text-gray-600 mb-4">Unable to initialize payment. Please try again.</p>
          <button
            onClick={() => navigate('/subscriptions/plans')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
          {planInfo && (
            <div className="text-gray-600">
              <p className="text-lg font-medium">{planInfo.name}</p>
              <p className="text-2xl font-bold text-blue-600">
                {planInfo.currency} {planInfo.amount}
              </p>
            </div>
          )}
        </div>

        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm planId={planId!} onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
}