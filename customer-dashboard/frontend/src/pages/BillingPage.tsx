import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  maxOutlets: number;
  maxUsers: number;
  features: string[];
}

interface BillingRecord {
  id: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  description: string;
  createdAt: string;
  paidAt?: string;
}

export default function BillingPage() {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [subscriptionRes, plansRes, billingRes] = await Promise.all([
        axios.get('/api/subscriptions/current').catch(() => ({ data: null })),
        axios.get('/api/subscriptions/plans'),
        axios.get('/api/subscriptions/billing'),
      ]);

      setCurrentSubscription(subscriptionRes.data);
      setAvailablePlans(plansRes.data);
      setBillingHistory(billingRes.data);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await axios.post('/api/subscriptions/subscribe', { planId });
      alert('Subscription updated successfully!');
      await loadBillingData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update subscription');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    if (currency === 'IDR') {
      return `Rp ${numAmount.toLocaleString('id-ID')}`;
    }
    return `${currency} ${numAmount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Billing & Subscription
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription plan and billing information.
          </p>
        </div>
      </div>

      {/* Current Subscription */}
      {currentSubscription ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Current Subscription
            </h3>
            <div className="border rounded-lg p-4 bg-primary-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {currentSubscription.plan.name}
                  </h4>
                  <p className="text-gray-600">{currentSubscription.plan.description}</p>
                  <p className="text-2xl font-bold text-primary-600 mt-2">
                    {formatCurrency(currentSubscription.plan.price, currentSubscription.plan.currency)}
                    <span className="text-sm font-normal text-gray-500">
                      /{currentSubscription.plan.interval}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentSubscription.subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentSubscription.subscription.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Max Outlets:</span>
                  <span className="ml-2 font-medium">{currentSubscription.plan.maxOutlets}</span>
                </div>
                <div>
                  <span className="text-gray-500">Max Users:</span>
                  <span className="ml-2 font-medium">{currentSubscription.plan.maxUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active subscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a plan below to get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Available Plans
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${
                  currentSubscription?.plan.id === plan.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                </div>
                
                <ul className="mt-6 space-y-2">
                  <li className="text-sm text-gray-600">
                    Up to {plan.maxOutlets} outlets
                  </li>
                  <li className="text-sm text-gray-600">
                    Up to {plan.maxUsers} users
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={currentSubscription?.plan.id === plan.id}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                      currentSubscription?.plan.id === plan.id
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                  >
                    {currentSubscription?.plan.id === plan.id ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Billing History
          </h3>
          
          {billingHistory.length === 0 ? (
            <div className="text-center py-6">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your billing history will appear here once you have transactions.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingHistory.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.amount, record.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {record.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}