import { useState, useEffect } from 'react';
import { Plus, Key, Copy, Trash2, Eye, EyeOff, Code, Shield } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string | null;
  createdAt: string;
  isActive: boolean;
  usageCount: number;
}

export default function APIManagementPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          key: 'sk_live_1234567890abcdef',
          permissions: ['read', 'write', 'delete'],
          lastUsed: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true,
          usageCount: 1245
        },
        {
          id: '2',
          name: 'Development API',
          key: 'sk_test_abcdef1234567890',
          permissions: ['read', 'write'],
          lastUsed: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-05T12:00:00Z',
          isActive: true,
          usageCount: 89
        },
        {
          id: '3',
          name: 'Analytics API',
          key: 'sk_analytics_fedcba0987654321',
          permissions: ['read'],
          lastUsed: null,
          createdAt: '2024-01-10T09:15:00Z',
          isActive: false,
          usageCount: 0
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '***' + key.substring(key.length - 4);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600">Manage API keys and access controls</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Generate API Key
        </button>
      </div>

      {/* API Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Code className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">API Documentation</h3>
            <p className="text-sm text-blue-700">
              View our complete API documentation and integration guides.
              <a href="#" className="ml-1 underline font-medium">Read Docs →</a>
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Key className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{apiKey.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {formatDate(apiKey.createdAt)}</span>
                      <span>Usage: {apiKey.usageCount} requests</span>
                      {apiKey.lastUsed && (
                        <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    apiKey.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-sm">
                      {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </div>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total API Keys</p>
              <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Keys</p>
              <p className="text-2xl font-bold text-gray-900">{apiKeys.filter(k => k.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {apiKeys.reduce((sum, key) => sum + key.usageCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Basic Tier</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">1,000</p>
            <p className="text-sm text-gray-500">requests per hour</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Pro Tier</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">10,000</p>
            <p className="text-sm text-gray-500">requests per hour</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Enterprise</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">Unlimited</p>
            <p className="text-sm text-gray-500">custom rate limits</p>
          </div>
        </div>
      </div>
    </div>
  );
}