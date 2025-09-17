import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface RevenueTrend {
  date: string;
  revenue: number;
}

interface MRRTrend {
  month: string;
  mrr: number;
}

interface RevenueAnalyticsData {
  revenueTrends: RevenueTrend[];
  mrrTrends: MRRTrend[];
}

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<RevenueAnalyticsData | null>(null);
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
    const fetchRevenueAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/analytics/revenue', {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setData(response.data);
      } catch (err) {
        console.error('Error fetching revenue analytics:', err);
        setError('Failed to load revenue analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalRevenue = data?.revenueTrends.reduce((sum, trend) => sum + (trend.revenue || 0), 0) || 0;
  const avgDailyRevenue = data?.revenueTrends.length ? totalRevenue / data.revenueTrends.length : 0;
  const currentMRR = data?.mrrTrends.length ? data.mrrTrends[data.mrrTrends.length - 1]?.mrr || 0 : 0;
  const projectedARR = currentMRR * 12;

  // Calculate growth rate (simplified)
  const revenueGrowth = (data?.revenueTrends && data.revenueTrends.length >= 2) ? 
    ((data.revenueTrends[data.revenueTrends.length - 1]?.revenue || 0) - 
     (data.revenueTrends[0]?.revenue || 0)) / (data.revenueTrends[0]?.revenue || 1) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600">Track revenue performance and growth trends</p>
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600">
              {revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">growth</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current MRR</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(currentMRR)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projected ARR</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(projectedARR)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Daily Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(avgDailyRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Revenue Trends</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented with Chart.js</p>
              <p className="text-xs text-gray-400 mt-1">
                {data?.revenueTrends.length || 0} data points for revenue trends
              </p>
            </div>
          </div>
        </div>

        {/* MRR Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Recurring Revenue (MRR)</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented with Chart.js</p>
              <p className="text-xs text-gray-400 mt-1">
                {data?.mrrTrends.length || 0} data points for MRR trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                <p className="text-sm text-gray-600">
                  {revenueGrowth > 0 
                    ? `Revenue has grown by ${revenueGrowth.toFixed(1)}% in the selected period`
                    : 'Revenue growth is stable or needs improvement'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">MRR Performance</p>
                <p className="text-sm text-gray-600">
                  Current MRR of {formatCurrency(currentMRR)} projects to {formatCurrency(projectedARR)} ARR
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Daily Average</p>
                <p className="text-sm text-gray-600">
                  Average daily revenue of {formatCurrency(avgDailyRevenue)} based on recent performance
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Period Revenue</p>
                <p className="text-sm text-gray-600">
                  Generated {formatCurrency(totalRevenue)} in total revenue for the selected period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Revenue Data */}
      {data?.revenueTrends && data.revenueTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Revenue Summary</h3>
          <div className="space-y-3">
            {data.revenueTrends.slice(-7).map((trend, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(trend.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(trend.revenue || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}