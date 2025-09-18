import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Globe, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import axios from 'axios';

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connectionsActive: number;
  };
  database: {
    connectionsActive: number;
    connectionsMax: number;
    queryTime: number;
    slowQueries: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeEndpoints: number;
  };
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadPerformanceData = async () => {
    try {
      const [metricsResponse, alertsResponse] = await Promise.all([
        axios.get('/api/admin/performance/metrics'),
        axios.get('/api/admin/performance/alerts')
      ]);
      
      setMetrics(metricsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      // Set mock data for demo
      setMetrics({
        cpu: { usage: 42, cores: 4, temperature: 65 },
        memory: { used: 6442450944, total: 16777216000, usage: 38 },
        disk: { used: 107374182400, total: 536870912000, usage: 20, readSpeed: 104857600, writeSpeed: 52428800 },
        network: { bytesIn: 1073741824, bytesOut: 536870912, connectionsActive: 156 },
        database: { connectionsActive: 12, connectionsMax: 100, queryTime: 45, slowQueries: 3 },
        api: { requestsPerMinute: 245, averageResponseTime: 125, errorRate: 0.8, activeEndpoints: 48 }
      });
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600 bg-red-100';
    if (usage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get('/api/admin/performance/report', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `performance-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

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

  const UsageCard = ({ title, usage, details, icon: Icon, color }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
      <div className="flex items-center mb-4">
        <Icon className={`h-5 w-5 ${color} mr-2`} />
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{usage}%</div>
      {details && <p className="text-sm text-gray-500 mb-2">{details}</p>}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            usage > 80 ? 'bg-red-500' : 
            usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${usage}%` }}
        ></div>
      </div>
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${getUsageColor(usage)}`}>
        {usage > 80 ? 'Critical' : usage > 60 ? 'Warning' : 'Normal'}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'system', label: 'System Resources' },
    { id: 'database', label: 'Database' },
    { id: 'api', label: 'API Performance' },
    { id: 'network', label: 'Network' }
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
          <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor system performance and resource usage</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
          </select>
          <button
            onClick={loadPerformanceData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={downloadReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">Performance Alerts</h3>
          </div>
          <div className="mt-2 space-y-1">
            {alerts.map((alert: any, index: number) => (
              <div key={index} className="text-sm text-yellow-800">
                • {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="CPU Usage"
              value={`${metrics?.cpu.usage || 0}%`}
              subtitle={`${metrics?.cpu.cores || 0} cores available`}
              icon={Cpu}
              color="text-blue-600"
            />
            <StatCard
              title="Memory Usage"
              value={`${metrics?.memory.usage || 0}%`}
              subtitle={`${formatBytes(metrics?.memory.used || 0)} / ${formatBytes(metrics?.memory.total || 0)}`}
              icon={HardDrive}
              color="text-green-600"
            />
            <StatCard
              title="API Response Time"
              value={`${metrics?.api.averageResponseTime || 0}ms`}
              subtitle={`${formatNumber(metrics?.api.requestsPerMinute || 0)} req/min`}
              icon={Clock}
              color="text-purple-600"
            />
            <StatCard
              title="Error Rate"
              value={`${(metrics?.api.errorRate || 0).toFixed(2)}%`}
              subtitle="API error rate"
              icon={AlertTriangle}
              color={metrics?.api.errorRate && metrics.api.errorRate > 5 ? "text-red-600" : "text-green-600"}
            />
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Activity className="w-8 h-8 mr-2" />
              Performance chart would be rendered here
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UsageCard
              title="CPU Usage"
              usage={metrics?.cpu.usage || 0}
              details={`${metrics?.cpu.cores || 0} cores • ${metrics?.cpu.temperature || 0}°C`}
              icon={Cpu}
              color="text-blue-600"
            />
            <UsageCard
              title="Memory Usage"
              usage={metrics?.memory.usage || 0}
              details={`${formatBytes(metrics?.memory.used || 0)} / ${formatBytes(metrics?.memory.total || 0)}`}
              icon={HardDrive}
              color="text-green-600"
            />
            <UsageCard
              title="Disk Usage"
              usage={metrics?.disk.usage || 0}
              details={`${formatBytes(metrics?.disk.used || 0)} / ${formatBytes(metrics?.disk.total || 0)}`}
              icon={Database}
              color="text-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Disk I/O Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Read Speed:</span>
                  <span className="text-sm font-medium">{formatBytes(metrics?.disk.readSpeed || 0)}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Write Speed:</span>
                  <span className="text-sm font-medium">{formatBytes(metrics?.disk.writeSpeed || 0)}/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 text-blue-600 mr-2" />
                Database Connections
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Connections:</span>
                  <span className="text-lg font-semibold">{metrics?.database.connectionsActive || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Max Connections:</span>
                  <span className="text-sm font-medium">{metrics?.database.connectionsMax || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ 
                      width: `${((metrics?.database.connectionsActive || 0) / (metrics?.database.connectionsMax || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                Query Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Query Time:</span>
                  <span className="text-lg font-semibold">{metrics?.database.queryTime || 0}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Slow Queries:</span>
                  <span className="text-sm font-medium text-yellow-600">{metrics?.database.slowQueries || 0}</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (metrics?.database.queryTime || 0) > 1000 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {(metrics?.database.queryTime || 0) > 1000 ? 'Needs Optimization' : 'Performance Good'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                Request Volume
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Requests per Minute:</span>
                  <span className="text-lg font-semibold">{formatNumber(metrics?.api.requestsPerMinute || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Endpoints:</span>
                  <span className="text-sm font-medium">{metrics?.api.activeEndpoints || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                Response Times
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Response:</span>
                  <span className="text-lg font-semibold">{metrics?.api.averageResponseTime || 0}ms</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (metrics?.api.averageResponseTime || 0) > 1000 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {(metrics?.api.averageResponseTime || 0) > 1000 ? 'Slow' : 'Fast'}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Error Rates
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate:</span>
                  <span className="text-lg font-semibold">{(metrics?.api.errorRate || 0).toFixed(2)}%</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (metrics?.api.errorRate || 0) > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {(metrics?.api.errorRate || 0) > 5 ? 'High Error Rate' : 'Normal'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                Network Traffic
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bytes In:</span>
                  <span className="text-lg font-semibold">{formatBytes(metrics?.network.bytesIn || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bytes Out:</span>
                  <span className="text-lg font-semibold">{formatBytes(metrics?.network.bytesOut || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Connections:</span>
                  <span className="text-lg font-semibold">{metrics?.network.connectionsActive || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}