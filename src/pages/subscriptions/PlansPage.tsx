import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Star, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  maxOutlets: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          name: 'Basic',
          description: 'Perfect for small businesses',
          price: 250000,
          currency: 'IDR',
          interval: 'monthly',
          maxOutlets: 1,
          maxUsers: 3,
          features: ['Basic POS', 'Inventory Management', 'Sales Reports', 'Email Support'],
          isActive: true,
          subscriberCount: 45
        },
        {
          id: '2',
          name: 'Pro',
          description: 'Great for growing businesses',
          price: 500000,
          currency: 'IDR',
          interval: 'monthly',
          maxOutlets: 5,
          maxUsers: 10,
          features: ['Advanced POS', 'Multi-outlet Management', 'Advanced Reports', 'Loyalty Program', 'Priority Support'],
          isActive: true,
          subscriberCount: 128
        },
        {
          id: '3',
          name: 'Enterprise',
          description: 'For large businesses',
          price: 1000000,
          currency: 'IDR',
          interval: 'monthly',
          maxOutlets: 999,
          maxUsers: 999,
          features: ['Enterprise POS', 'Unlimited Outlets', 'Custom Reports', 'API Access', 'Dedicated Support'],
          isActive: true,
          subscriberCount: 23
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency
    }).format(price);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Manage your pricing plans and features</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                {plan.name === 'Pro' && (
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-600 ml-1">/{plan.interval}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Outlets:</span>
                  <span className="font-medium">{plan.maxOutlets === 999 ? 'Unlimited' : plan.maxOutlets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Users:</span>
                  <span className="font-medium">{plan.maxUsers === 999 ? 'Unlimited' : plan.maxUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subscribers:</span>
                  <span className="font-medium">{plan.subscriberCount}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">IDR 149M</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{plans.reduce((sum, plan) => sum + plan.subscriberCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}