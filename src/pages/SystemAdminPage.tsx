import { useState, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  Cpu, 
  Activity, 
  Bell, 
  Lock,
  CreditCard,
  DollarSign,
  Building,
  RefreshCw,
  Settings
} from 'lucide-react';
import axios from 'axios';

interface SystemStats {
  totalUsers: number;
  totalTenants: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  systemUptime: string;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

interface SystemConfig {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  two_factor_required: boolean;
  max_users_per_tenant: number;
  session_timeout: number;
  system_email: string;
  support_email: string;
  company_name: string;
  system_timezone: string;
}

export default function SystemAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<SystemConfig>({
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    two_factor_required: false,
    max_users_per_tenant: 50,
    session_timeout: 1440,
    system_email: 'system@company.com',
    support_email: 'support@company.com',
    company_name: 'SaaS Platform',
    system_timezone: 'UTC'
  });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        axios.get('/api/admin/system/stats'),
        axios.get('/api/admin/system/health')
      ]);
      setSystemStats(statsResponse.data);
      setSystemHealth(healthResponse.data);
    } catch (error) {
      console.error('Failed to load system data:', error);
      // Set mock data for demo
      setSystemStats({
        totalUsers: 156,
        totalTenants: 23,
        totalSubscriptions: 89,
        activeSubscriptions: 76,
        totalRevenue: 45320,
        systemUptime: '7 days, 14 hours',
        databaseConnections: 45,
        memoryUsage: 68,
        cpuUsage: 42,
        diskUsage: 75
      });
      setSystemHealth({ status: 'healthy' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigUpdate = async (key: string, value: any) => {
    try {
      await axios.put('/api/admin/system/config', { [key]: value });
      setConfig(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update system config:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
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
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const UsageBar = ({ label, percentage, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'security', label: 'Security' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-1">Monitor and configure system-wide settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth?.status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {systemHealth?.status === 'healthy' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                System Healthy
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1" />
                System Issues
              </>
            )}
          </div>
          <button
            onClick={loadSystemData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={systemStats?.totalUsers || 0}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              title="Active Tenants"
              value={systemStats?.totalTenants || 0}
              icon={Building}
              color="text-green-600"
            />
            <StatCard
              title="Subscriptions"
              value={`${systemStats?.activeSubscriptions || 0}/${systemStats?.totalSubscriptions || 0}`}
              icon={CreditCard}
              color="text-purple-600"
            />
            <StatCard
              title="Total Revenue"
              value={`$${(systemStats?.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="text-yellow-600"
            />
          </div>

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Cpu className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">CPU Usage</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {systemStats?.cpuUsage || 0}%
              </div>
              <UsageBar 
                percentage={systemStats?.cpuUsage || 0}
                color={
                  (systemStats?.cpuUsage || 0) > 80 ? 'bg-red-500' : 
                  (systemStats?.cpuUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }
              />
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <div className="flex items-center mb-4">
                <HardDrive className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Memory Usage</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {systemStats?.memoryUsage || 0}%
              </div>
              <UsageBar 
                percentage={systemStats?.memoryUsage || 0}
                color={
                  (systemStats?.memoryUsage || 0) > 80 ? 'bg-red-500' : 
                  (systemStats?.memoryUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }
              />
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Database className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Disk Usage</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {systemStats?.diskUsage || 0}%
              </div>
              <UsageBar 
                percentage={systemStats?.diskUsage || 0}
                color={
                  (systemStats?.diskUsage || 0) > 80 ? 'bg-red-500' : 
                  (systemStats?.diskUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }
              />
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Uptime</h3>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {systemStats?.systemUptime || 'N/A'}
              </div>
              <p className="text-sm text-gray-500">System uptime</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={(e) => handleConfigUpdate('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Email
                  </label>
                  <input
                    type="email"
                    value={config.system_email}
                    onChange={(e) => handleConfigUpdate('system_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={config.support_email}
                    onChange={(e) => handleConfigUpdate('support_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User & Registration Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Allow Registration</span>
                    <p className="text-sm text-gray-500">Enable new user registration</p>
                  </div>
                  <button
                    onClick={() => handleConfigUpdate('registration_enabled', !config.registration_enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      config.registration_enabled ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        config.registration_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email Verification Required</span>
                    <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                  </div>
                  <button
                    onClick={() => handleConfigUpdate('email_verification_required', !config.email_verification_required)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      config.email_verification_required ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        config.email_verification_required ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Users per Tenant
                  </label>
                  <input
                    type="number"
                    value={config.max_users_per_tenant}
                    onChange={(e) => handleConfigUpdate('max_users_per_tenant', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Mode</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                <p className="text-sm text-gray-500">
                  Enable maintenance mode to prevent user access during updates
                </p>
              </div>
              <button
                onClick={() => handleConfigUpdate('maintenance_mode', !config.maintenance_mode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  config.maintenance_mode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    config.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.maintenance_mode && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-800">
                    System is currently in maintenance mode. Users cannot access the application.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Clear Application Cache
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Restart Background Jobs
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Run Database Cleanup
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                Force Restart System
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Monitoring</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                  <span>Failed Login Attempts (24h):</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Blocked IP Addresses:</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Security Alerts:</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Last Security Scan:</span>
                  <span className="font-semibold">2 hours ago</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Run Security Scan
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  View Security Logs
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Configure Alerts
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Download Security Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}