import { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

interface TwoFactorStats {
  totalUsers: number;
  usersWithTwoFactor: number;
  adoptionRate: number;
  methodBreakdown: {
    totp: number;
    sms: number;
    email: number;
  };
  recentSetups: number;
  backupCodesGenerated: number;
}

interface TwoFactorUser {
  id: string;
  username: string;
  email: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  backupCodesRemaining: number;
  lastUsed: string;
  setupDate: string;
  trustedDevices: number;
}

interface TwoFactorConfig {
  enabled: boolean;
  required: boolean;
  allowedMethods: string[];
  backupCodesEnabled: boolean;
  trustedDeviceDuration: number;
  maxBackupCodes: number;
  codeExpiry: number;
}

export default function TwoFactorAuthPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<TwoFactorStats | null>(null);
  const [users, setUsers] = useState<TwoFactorUser[]>([]);
  const [config, setConfig] = useState<TwoFactorConfig>({
    enabled: true,
    required: false,
    allowedMethods: ['totp', 'sms'],
    backupCodesEnabled: true,
    trustedDeviceDuration: 30,
    maxBackupCodes: 10,
    codeExpiry: 300
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, usersResponse, configResponse] = await Promise.all([
        axios.get('/api/admin/two-factor/stats'),
        axios.get('/api/admin/two-factor/users'),
        axios.get('/api/admin/two-factor/config')
      ]);
      
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setConfig(configResponse.data);
    } catch (error) {
      console.error('Failed to load two-factor data:', error);
      // Set mock data for demo
      setStats({
        totalUsers: 142,
        usersWithTwoFactor: 89,
        adoptionRate: 62.7,
        methodBreakdown: {
          totp: 65,
          sms: 20,
          email: 4
        },
        recentSetups: 12,
        backupCodesGenerated: 78
      });
      
      setUsers([
        {
          id: '1',
          username: 'admin',
          email: 'admin@company.com',
          twoFactorEnabled: true,
          twoFactorMethod: 'totp',
          backupCodesRemaining: 8,
          lastUsed: '2024-01-15T10:30:00Z',
          setupDate: '2024-01-01T09:00:00Z',
          trustedDevices: 2
        },
        {
          id: '2',
          username: 'manager1',
          email: 'manager@company.com',
          twoFactorEnabled: true,
          twoFactorMethod: 'sms',
          backupCodesRemaining: 10,
          lastUsed: '2024-01-14T14:20:00Z',
          setupDate: '2024-01-05T11:30:00Z',
          trustedDevices: 1
        },
        {
          id: '3',
          username: 'staff1',
          email: 'staff@company.com',
          twoFactorEnabled: false,
          twoFactorMethod: '',
          backupCodesRemaining: 0,
          lastUsed: '',
          setupDate: '',
          trustedDevices: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      await axios.put('/api/admin/two-factor/config', config);
      // Show success message
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const disable2FAForUser = async (userId: string) => {
    if (confirm('Are you sure you want to disable 2FA for this user? This will remove all their 2FA settings.')) {
      try {
        await axios.post(`/api/admin/two-factor/users/${userId}/disable`);
        loadData();
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
      }
    }
  };

  const regenerateBackupCodes = async (userId: string) => {
    if (confirm('This will invalidate all existing backup codes. Continue?')) {
      try {
        await axios.post(`/api/admin/two-factor/users/${userId}/regenerate-codes`);
        loadData();
      } catch (error) {
        console.error('Failed to regenerate backup codes:', error);
      }
    }
  };

  const force2FASetup = async (userId: string) => {
    try {
      await axios.post(`/api/admin/two-factor/users/${userId}/force-setup`);
      // This would send an email to the user requiring them to set up 2FA
      loadData();
    } catch (error) {
      console.error('Failed to force 2FA setup:', error);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'totp':
        return <Smartphone className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'totp':
        return 'Authenticator App';
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-1">Manage 2FA settings and monitor user adoption</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={saveConfig}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              title="2FA Enabled"
              value={stats?.usersWithTwoFactor || 0}
              subtitle={`${stats?.adoptionRate || 0}% adoption rate`}
              icon={Shield}
              color="text-green-600"
            />
            <StatCard
              title="Recent Setups"
              value={stats?.recentSetups || 0}
              subtitle="Last 30 days"
              icon={Clock}
              color="text-purple-600"
            />
            <StatCard
              title="Backup Codes"
              value={stats?.backupCodesGenerated || 0}
              subtitle="Generated"
              icon={Key}
              color="text-yellow-600"
            />
          </div>

          {/* Method Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">2FA Methods Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Authenticator Apps</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.methodBreakdown.totp || 0} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${((stats?.methodBreakdown.totp || 0) / (stats?.usersWithTwoFactor || 1)) * 100}%` 
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">SMS</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.methodBreakdown.sms || 0} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ 
                      width: `${((stats?.methodBreakdown.sms || 0) / (stats?.usersWithTwoFactor || 1)) * 100}%` 
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.methodBreakdown.email || 0} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ 
                      width: `${((stats?.methodBreakdown.email || 0) / (stats?.usersWithTwoFactor || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h3>
              <div className="space-y-3">
                {(stats?.adoptionRate || 0) < 70 && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Low 2FA Adoption</p>
                      <p className="text-sm text-yellow-700">Consider making 2FA mandatory for better security.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Backup Codes Active</p>
                    <p className="text-sm text-blue-700">Users can recover access if they lose their 2FA device.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Multiple Methods Supported</p>
                    <p className="text-sm text-green-700">Users can choose their preferred authentication method.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User 2FA Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2FA Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup Codes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.twoFactorEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.twoFactorEnabled ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Disabled
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.twoFactorEnabled ? (
                        <div className="flex items-center">
                          {getMethodIcon(user.twoFactorMethod)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getMethodName(user.twoFactorMethod)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.twoFactorEnabled ? `${user.backupCodesRemaining}/10` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.twoFactorEnabled ? (
                          <>
                            <button
                              onClick={() => regenerateBackupCodes(user.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Regenerate Codes
                            </button>
                            <button
                              onClick={() => disable2FAForUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Disable 2FA
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => force2FASetup(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Force Setup
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">2FA Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Expiry Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.codeExpiry}
                    onChange={(e) => setConfig(prev => ({ ...prev, codeExpiry: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min="30"
                    max="600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trusted Device Duration (days)
                  </label>
                  <input
                    type="number"
                    value={config.trustedDeviceDuration}
                    onChange={(e) => setConfig(prev => ({ ...prev, trustedDeviceDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min="1"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Backup Codes
                  </label>
                  <input
                    type="number"
                    value={config.maxBackupCodes}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxBackupCodes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min="5"
                    max="20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">General Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Enable 2FA</span>
                      <p className="text-sm text-gray-500">Allow users to set up 2FA</p>
                    </div>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        config.enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                          config.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Require 2FA</span>
                      <p className="text-sm text-gray-500">Force all users to use 2FA</p>
                    </div>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, required: !prev.required }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        config.required ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                          config.required ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Enable Backup Codes</span>
                      <p className="text-sm text-gray-500">Allow backup code generation</p>
                    </div>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, backupCodesEnabled: !prev.backupCodesEnabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        config.backupCodesEnabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                          config.backupCodesEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Allowed Methods</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'totp', label: 'Authenticator App (TOTP)', icon: Smartphone },
                      { id: 'sms', label: 'SMS', icon: Smartphone },
                      { id: 'email', label: 'Email', icon: Mail }
                    ].map(method => {
                      const Icon = method.icon;
                      return (
                        <label key={method.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.allowedMethods.includes(method.id)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...config.allowedMethods, method.id]
                                : config.allowedMethods.filter(m => m !== method.id);
                              setConfig(prev => ({ ...prev, allowedMethods: methods }));
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <Icon className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">{method.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}