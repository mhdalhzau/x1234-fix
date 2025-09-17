import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Crown } from 'lucide-react';
import axios from 'axios';

interface UserTrend {
  date: string;
  count: number;
}

interface RoleDistribution {
  role: string;
  count: number;
}

interface UserAnalyticsData {
  trends: UserTrend[];
  roleDistribution: RoleDistribution[];
}

export default function UserAnalyticsPage() {
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/analytics/users', {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setData(response.data);
      } catch (err) {
        console.error('Error fetching user analytics:', err);
        setError('Failed to load user analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalUsers = data?.roleDistribution.reduce((sum, role) => sum + role.count, 0) || 0;
  const newUsersThisPeriod = data?.trends.reduce((sum, trend) => sum + trend.count, 0) || 0;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return Crown;
      case 'tenant_owner':
        return UserCheck;
      case 'admin':
        return Users;
      case 'staff':
        return UserPlus;
      default:
        return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'tenant_owner':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'tenant_owner':
        return 'Tenant Owner';
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Track user registration and role distribution</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Users (Period)</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{newUsersThisPeriod}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalUsers > 0 ? ((newUsersThisPeriod / totalUsers) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
        <div className="space-y-4">
          {data?.roleDistribution.map((role) => {
            const IconComponent = getRoleIcon(role.role);
            const percentage = totalUsers > 0 ? (role.count / totalUsers) * 100 : 0;
            
            return (
              <div key={role.role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getRoleDisplayName(role.role)}
                    </p>
                    <p className="text-xs text-gray-500">{role.count} users</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.role)}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Registration Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart will be implemented with Chart.js</p>
            <p className="text-xs text-gray-400 mt-1">
              {data?.trends.length || 0} data points for the selected period
            </p>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      {data?.trends && data.trends.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Registration Summary</h3>
          <div className="space-y-3">
            {data.trends.slice(-7).map((trend, index) => (
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
                  <span className="text-sm font-medium text-gray-900">{trend.count} new users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}