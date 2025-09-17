import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface SubscriptionTrend {
  date: string;
  count: number;
}

interface PlanDistribution {
  planName: string;
  count: number;
  revenue: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface SubscriptionAnalyticsData {
  trends: SubscriptionTrend[];
  planDistribution: PlanDistribution[];
  statusDistribution: StatusDistribution[];
}

export default function SubscriptionAnalyticsPage() {
  const [data, setData] = useState<SubscriptionAnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchSubscriptionAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/analytics/subscriptions', {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setData(response.data);
      } catch (err) {
        console.error('Error fetching subscription analytics:', err);
        setError('Failed to load subscription analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalSubscriptions = data?.statusDistribution.reduce((sum, status) => sum + status.count, 0) || 0;
  const activeSubscriptions = data?.statusDistribution.find(s => s.status === 'active')?.count || 0;
  const totalRevenue = data?.planDistribution.reduce((sum, plan) => sum + (plan.revenue || 0), 0) || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'expired':
        return XCircle;
      case 'pending':
        return Clock;
      default:
        return CreditCard;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Analytics</h1>
          <p className="text-gray-600">Track subscription performance and plan distribution</p>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="1year">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalSubscriptions}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeSubscriptions}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalSubscriptions > 0 ? ((activeSubscriptions / totalSubscriptions) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Plan Distribution</h3>
        <div className="space-y-4">
          {data?.planDistribution.map((plan, index) => {
            const percentage = totalSubscriptions > 0 ? (plan.count / totalSubscriptions) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.planName}</p>
                    <p className="text-xs text-gray-500">{plan.count} subscriptions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(plan.revenue || 0)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Status Distribution</h3>
        <div className="space-y-4">
          {data?.statusDistribution.map((status, index) => {
            const IconComponent = getStatusIcon(status.status);
            const percentage = totalSubscriptions > 0 ? (status.count / totalSubscriptions) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusDisplayName(status.status)}
                    </p>
                    <p className="text-xs text-gray-500">{status.count} subscriptions</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Growth Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart will be implemented with Chart.js</p>
            <p className="text-xs text-gray-400 mt-1">
              {data?.trends.length || 0} data points for the selected period
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}