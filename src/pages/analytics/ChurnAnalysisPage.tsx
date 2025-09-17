import { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import axios from 'axios';

interface ChurnData {
  churnRate: { value: number; change: number; trend: 'up' | 'down' };
  atRiskUsers: number;
  churnReasons: { reason: string; count: number; percentage: number }[];
  cohortData: { period: string; retention: number }[];
}

export default function ChurnAnalysisPage() {
  const [data, setData] = useState<ChurnData | null>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchChurnAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/analytics/churn', {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setData(response.data);
      } catch (err) {
        console.error('Error fetching churn analytics:', err);
        setError('Failed to load churn analytics data. Please try again.');
        
        // Fallback to demo data
        setData({
          churnRate: { value: 2.8, change: -0.5, trend: 'down' },
          atRiskUsers: 12,
          churnReasons: [
            { reason: 'Price concerns', count: 8, percentage: 35.2 },
            { reason: 'Better competitor', count: 6, percentage: 26.1 },
            { reason: 'Lack of features', count: 4, percentage: 17.4 },
            { reason: 'Poor support', count: 3, percentage: 13.0 },
            { reason: 'Technical issues', count: 2, percentage: 8.7 }
          ],
          cohortData: [
            { period: 'Month 1', retention: 95.2 },
            { period: 'Month 3', retention: 87.1 },
            { period: 'Month 6', retention: 78.9 },
            { period: 'Month 12', retention: 71.3 },
            { period: 'Month 24', retention: 65.8 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurnAnalytics();
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
          <h1 className="text-2xl font-bold text-gray-900">Churn Analysis</h1>
          <p className="text-gray-600">Monitor customer retention and identify at-risk accounts</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {data?.churnRate ? formatPercentage(data.churnRate.value) : '0%'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              data?.churnRate?.trend === 'down' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <TrendingDown className={`h-6 w-6 ${
                data?.churnRate?.trend === 'down' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {data?.churnRate?.trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              data?.churnRate?.trend === 'down' ? 'text-green-600' : 'text-red-600'
            }`}>
              {data?.churnRate?.change ? `${data.churnRate.change > 0 ? '+' : ''}${formatPercentage(data.churnRate.change)}` : '0%'}
            </span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">At-Risk Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data?.atRiskUsers || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Require immediate attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Customer Lifetime</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {data?.churnRate?.value ? (100 / data.churnRate.value).toFixed(1) : '36'} months
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Based on current churn rate</span>
          </div>
        </div>
      </div>

      {/* Churn Reasons & Cohort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Reasons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Churn Reasons</h3>
          <div className="space-y-4">
            {data?.churnReasons?.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{reason.reason}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{reason.count} users</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPercentage(reason.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Cohort */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Retention by Cohort</h3>
          <div className="space-y-4">
            {data?.cohortData?.map((cohort, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    cohort.retention > 80 ? 'bg-green-500' : 
                    cohort.retention > 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{cohort.period}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cohort.retention > 80 ? 'bg-green-500' : 
                        cohort.retention > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cohort.retention}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {formatPercentage(cohort.retention)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Healthy Churn Rate</p>
                <p className="text-sm text-gray-600">
                  Your churn rate of {data?.churnRate ? formatPercentage(data.churnRate.value) : '2.8%'} is 
                  below the SaaS industry average of 5-10%
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Strong Early Retention</p>
                <p className="text-sm text-gray-600">
                  95% retention in the first month indicates good onboarding and product fit
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Price Sensitivity</p>
                <p className="text-sm text-gray-600">
                  35% of churned users cited pricing concerns - consider value communication
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Monitor At-Risk Users</p>
                <p className="text-sm text-gray-600">
                  {data?.atRiskUsers || 12} users showing early churn signals - reach out proactively
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}