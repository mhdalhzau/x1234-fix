import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  XCircle, 
  Lock
} from 'lucide-react';
import axios from 'axios';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isCore: boolean;
}

const PERMISSION_CATEGORIES = [
  'User Management',
  'Content Management', 
  'Billing & Subscriptions',
  'Analytics & Reports',
  'System Administration',
  'Organization Management',
  'API Access'
];

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        axios.get('/api/admin/roles'),
        axios.get('/api/admin/permissions')
      ]);
      
      setRoles(rolesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set mock data for demo
      setRoles([
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: ['*'],
          userCount: 2,
          isSystem: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2', 
          name: 'Tenant Owner',
          description: 'Full access within tenant scope',
          permissions: ['tenant.manage', 'users.manage', 'billing.view'],
          userCount: 5,
          isSystem: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'Manager',
          description: 'Manage team and operations',
          permissions: ['users.view', 'content.manage', 'reports.view'],
          userCount: 12,
          isSystem: false,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          name: 'Staff',
          description: 'Basic operational access',
          permissions: ['content.view', 'reports.view'],
          userCount: 45,
          isSystem: false,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        }
      ]);
      
      setPermissions([
        { id: '1', name: 'users.manage', description: 'Create, edit, and delete users', category: 'User Management', isCore: true },
        { id: '2', name: 'users.view', description: 'View user information', category: 'User Management', isCore: true },
        { id: '3', name: 'content.manage', description: 'Create and edit content', category: 'Content Management', isCore: false },
        { id: '4', name: 'content.view', description: 'View content', category: 'Content Management', isCore: false },
        { id: '5', name: 'billing.manage', description: 'Manage billing and subscriptions', category: 'Billing & Subscriptions', isCore: true },
        { id: '6', name: 'billing.view', description: 'View billing information', category: 'Billing & Subscriptions', isCore: true },
        { id: '7', name: 'reports.manage', description: 'Create and manage reports', category: 'Analytics & Reports', isCore: false },
        { id: '8', name: 'reports.view', description: 'View reports and analytics', category: 'Analytics & Reports', isCore: false },
        { id: '9', name: 'system.manage', description: 'System administration access', category: 'System Administration', isCore: true },
        { id: '10', name: 'tenant.manage', description: 'Manage tenant settings', category: 'Organization Management', isCore: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '' });
    setSelectedPermissions([]);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, description: role.description });
    setSelectedPermissions(role.permissions);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      const roleData = {
        ...roleForm,
        permissions: selectedPermissions
      };

      if (editingRole) {
        await axios.put(`/api/admin/roles/${editingRole.id}`, roleData);
      } else {
        await axios.post('/api/admin/roles', roleData);
      }
      
      setIsRoleModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? Users with this role will lose their permissions.')) {
      try {
        await axios.delete(`/api/admin/roles/${roleId}`);
        loadData();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getPermissionsByCategory = (category: string) => {
    return permissions.filter(p => p.category === category);
  };

  const RoleCard = ({ role }: { role: Role }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${
            role.isSystem ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Shield className={`w-5 h-5 ${
              role.isSystem ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
            <p className="text-sm text-gray-500">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {role.isSystem && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              System Role
            </span>
          )}
          {!role.isSystem && (
            <>
              <button
                onClick={() => handleEditRole(role)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteRole(role.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{role.userCount} users assigned</span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Permissions:</span>
          <div className="mt-2 flex flex-wrap gap-1">
            {role.permissions.includes('*') ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                All Permissions
              </span>
            ) : (
              role.permissions.slice(0, 3).map(permission => (
                <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {permission}
                </span>
              ))
            )}
            {role.permissions.length > 3 && !role.permissions.includes('*') && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{role.permissions.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Lock }
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
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permission assignments</p>
        </div>
        {activeTab === 'roles' && (
          <button
            onClick={handleCreateRole}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </button>
        )}
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
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {PERMISSION_CATEGORIES.map(category => (
            <div key={category} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{category}</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPermissionsByCategory(category).map(permission => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`p-1 rounded ${
                        permission.isCore ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Lock className={`w-4 h-4 ${
                          permission.isCore ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                          {permission.isCore && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </h3>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter role description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {PERMISSION_CATEGORIES.map(category => (
                      <div key={category} className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {getPermissionsByCategory(category).map(permission => (
                            <label key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.name)}
                                onChange={() => togglePermission(permission.name)}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}