import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building, Users, Calendar, DollarSign } from 'lucide-react';

interface Tenant {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  status: 'trial' | 'active' | 'suspended' | 'expired';
  planName: string;
  userCount: number;
  outletCount: number;
  monthlyRevenue: number;
  createdAt: string;
  trialEndsAt: string | null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setTenants([
        {
          id: '1',
          businessName: 'Test Business',
          email: 'test@business.com',
          phone: '+62812345678',
          address: 'Jakarta, Indonesia',
          status: 'active',
          planName: 'Pro',
          userCount: 8,
          outletCount: 3,
          monthlyRevenue: 500000,
          createdAt: '2024-01-01T00:00:00Z',
          trialEndsAt: null
        },
        {
          id: '2',
          businessName: 'Startup Inc',
          email: 'info@startup.co',
          phone: '+62812345679',
          address: 'Bandung, Indonesia',
          status: 'trial',
          planName: 'Basic',
          userCount: 2,
          outletCount: 1,
          monthlyRevenue: 0,
          createdAt: '2024-01-15T10:30:00Z',
          trialEndsAt: '2024-02-15T10:30:00Z'
        },
        {
          id: '3',
          businessName: 'Enterprise Corp',
          email: 'admin@enterprise.com',
          phone: '+62812345680',
          address: 'Surabaya, Indonesia',
          status: 'active',
          planName: 'Enterprise',
          userCount: 25,
          outletCount: 12,
          monthlyRevenue: 1000000,
          createdAt: '2023-12-01T00:00:00Z',
          trialEndsAt: null
        },
        {
          id: '4',
          businessName: 'Small Shop',
          email: 'owner@smallshop.com',
          phone: '+62812345681',
          address: 'Yogyakarta, Indonesia',
          status: 'suspended',
          planName: 'Basic',
          userCount: 1,
          outletCount: 1,
          monthlyRevenue: 250000,
          createdAt: '2024-01-10T08:15:00Z',
          trialEndsAt: null
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600">Manage your organization tenants and accounts</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredTenants.length} of {tenants.length} tenants
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Building className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.businessName}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                        <div className="text-xs text-gray-400">{tenant.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(tenant.status)}`}>
                        {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                      </span>
                      <div className="text-sm text-gray-900">{tenant.planName} Plan</div>
                      {tenant.trialEndsAt && (
                        <div className="text-xs text-gray-500">
                          Trial ends: {formatDate(tenant.trialEndsAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {tenant.userCount} users
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="h-4 w-4 text-gray-400 mr-1" />
                        {tenant.outletCount} outlets
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {formatCurrency(tenant.monthlyRevenue)}/mo
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(tenant.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{tenants.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">T</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">On Trial</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.filter(t => t.status === 'trial').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total MRR</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}