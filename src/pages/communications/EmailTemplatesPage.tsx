import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Eye, Copy } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'welcome' | 'reset_password' | 'invoice' | 'notification' | 'marketing';
  description: string;
  lastModified: string;
  isActive: boolean;
  usageCount: number;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setTemplates([
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to our platform!',
          type: 'welcome',
          description: 'Sent to new users after registration',
          lastModified: '2024-01-15T10:30:00Z',
          isActive: true,
          usageCount: 245
        },
        {
          id: '2',
          name: 'Password Reset',
          subject: 'Reset your password',
          type: 'reset_password',
          description: 'Sent when users request password reset',
          lastModified: '2024-01-12T15:45:00Z',
          isActive: true,
          usageCount: 89
        },
        {
          id: '3',
          name: 'Invoice Template',
          subject: 'Your invoice is ready',
          type: 'invoice',
          description: 'Sent with subscription invoices',
          lastModified: '2024-01-10T09:20:00Z',
          isActive: true,
          usageCount: 156
        },
        {
          id: '4',
          name: 'System Notification',
          subject: 'Important system update',
          type: 'notification',
          description: 'For system announcements',
          lastModified: '2024-01-08T14:15:00Z',
          isActive: false,
          usageCount: 12
        },
        {
          id: '5',
          name: 'Monthly Newsletter',
          subject: 'Your monthly update',
          type: 'marketing',
          description: 'Monthly marketing campaign',
          lastModified: '2024-01-05T11:00:00Z',
          isActive: true,
          usageCount: 387
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template => {
    return typeFilter === 'all' || template.type === typeFilter;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-green-100 text-green-800';
      case 'reset_password':
        return 'bg-red-100 text-red-800';
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'notification':
        return 'bg-yellow-100 text-yellow-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Manage your email templates and campaigns</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by type:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="welcome">Welcome</option>
            <option value="reset_password">Password Reset</option>
            <option value="invoice">Invoice</option>
            <option value="notification">Notification</option>
            <option value="marketing">Marketing</option>
          </select>
          <div className="text-sm text-gray-600">
            {filteredTemplates.length} of {templates.length} templates
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(template.type)}`}>
                      {template.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-sm font-medium text-gray-900">Subject: {template.subject}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Modified: {formatDate(template.lastModified)}</span>
                <span>Used: {template.usageCount} times</span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </button>
                <button className="flex-1 bg-primary-100 text-primary-700 px-3 py-2 rounded-md hover:bg-primary-200 flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200">
                  <Trash2 className="h-4 w-4" />
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
            <Mail className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{templates.filter(t => t.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-bold">★</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Most Used</p>
              <p className="text-lg font-bold text-gray-900">{Math.max(...templates.map(t => t.usageCount))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}