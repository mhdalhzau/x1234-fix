import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Calendar } from 'lucide-react';
import axios from 'axios';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface ApiMetrics {
  mrr: { value: number; change: number; trend: 'up' | 'down' };
  arr: { value: number; change: number; trend: 'up' | 'down' };
  activeSubscribers: { value: number; change: number; trend: 'up' | 'down' };
  churnRate: { value: number; change: number; trend: 'up' | 'down' };
  arpu: { value: number; change: number; trend: 'up' | 'down' };
  clv: { value: number; change: number; trend: 'up' | 'down' };
}

export default function SaaSMetricsPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/analytics/metrics', {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data: ApiMetrics = response.data;

        const formattedMetrics: MetricCard[] = [
          {
            title: 'Monthly Recurring Revenue (MRR)',
            value: formatCurrency(data.mrr.value),
            change: `${data.mrr.change > 0 ? '+' : ''}${formatPercentage(data.mrr.change)}`,
            trend: data.mrr.trend,
            icon: DollarSign
          },
          {
            title: 'Annual Recurring Revenue (ARR)',
            value: formatCurrency(data.arr.value),
            change: `${data.arr.change > 0 ? '+' : ''}${formatPercentage(data.arr.change)}`,
            trend: data.arr.trend,
            icon: TrendingUp
          },
          {
            title: 'Active Subscribers',
            value: data.activeSubscribers.value.toString(),
            change: `${data.activeSubscribers.change > 0 ? '+' : ''}${formatPercentage(data.activeSubscribers.change)}`,
            trend: data.activeSubscribers.trend,
            icon: Users
          },
          {
            title: 'Churn Rate',
            value: formatPercentage(data.churnRate.value),
            change: `${data.churnRate.change > 0 ? '+' : ''}${formatPercentage(data.churnRate.change)}`,
            trend: data.churnRate.trend,
            icon: TrendingDown
          },
          {
            title: 'Average Revenue Per User (ARPU)',
            value: formatCurrency(data.arpu.value),
            change: `${data.arpu.change > 0 ? '+' : ''}${formatPercentage(data.arpu.change)}`,
            trend: data.arpu.trend,
            icon: BarChart3
          },
          {
            title: 'Customer Lifetime Value (CLV)',
            value: formatCurrency(data.clv.value),
            change: `${data.clv.change > 0 ? '+' : ''}${formatPercentage(data.clv.change)}`,
            trend: data.clv.trend,
            icon: Calendar
          }
        ];

        setMetrics(formattedMetrics);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load analytics data. Please try again.');
        
        // Fallback to mock data if API fails
        setMetrics([
          {
            title: 'Monthly Recurring Revenue (MRR)',
            value: 'Rp 0',
            change: '+0%',
            trend: 'up',
            icon: DollarSign
          },
          {
            title: 'Annual Recurring Revenue (ARR)',
            value: 'Rp 0',
            change: '+0%',
            trend: 'up',
            icon: TrendingUp
          },
          {
            title: 'Active Subscribers',
            value: '0',
            change: '+0%',
            trend: 'up',
            icon: Users
          },
          {
            title: 'Churn Rate',
            value: '0%',
            change: '+0%',
            trend: 'up',
            icon: TrendingDown
          },
          {
            title: 'Average Revenue Per User (ARPU)',
            value: 'Rp 0',
            change: '+0%',
            trend: 'up',
            icon: BarChart3
          },
          {
            title: 'Customer Lifetime Value (CLV)',
            value: 'Rp 0',
            change: '+0%',
            trend: 'up',
            icon: Calendar
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRange]);

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
          <h1 className="text-2xl font-bold text-gray-900">SaaS Metrics Dashboard</h1>
          <p className="text-gray-600">Monitor your key SaaS performance indicators</p>
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <IconComponent className={`h-6 w-6 ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Growth Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">MRR Growth</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented with Chart.js</p>
            </div>
          </div>
        </div>

        {/* Customer Acquisition Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Acquisition</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented with Chart.js</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Strong MRR Growth</p>
              <p className="text-sm text-gray-600">Your monthly recurring revenue is growing at a healthy 8.2% rate</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Low Churn Rate</p>
              <p className="text-sm text-gray-600">Your churn rate of 2.8% is below industry average of 5%</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">High Customer Value</p>
              <p className="text-sm text-gray-600">CLV of $1,147 indicates strong customer retention and value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}