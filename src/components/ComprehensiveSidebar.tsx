import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Shield,
  BarChart3,
  Bell,
  FileText,
  Palette,
  Code,
  Mail,
  Calendar,
  HelpCircle,
  Star,
  Building,
  Database,
  Webhook,
  Globe,
  Lock,
  Package,
  Zap,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Store
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  badge?: string;
  children?: NavItem[];
}

const saasNavigation: NavItem[] = [
  // Dashboard & Analytics - All users can see dashboard
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    roles: ['superadmin', 'tenant_owner', 'admin', 'staff'] 
  },
  
  // SaaS Analytics & Metrics - Only for business insights
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'Key Metrics', href: '/analytics/metrics', icon: TrendingUp, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Revenue Reports', href: '/analytics/revenue', icon: CreditCard, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'User Analytics', href: '/analytics/users', icon: Users, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'Churn Analysis', href: '/analytics/churn', icon: BarChart3, roles: ['superadmin', 'tenant_owner'] }
    ]
  },

  // Authentication & User Management
  { 
    name: 'User Management', 
    href: '/user-management', 
    icon: Users, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'Users', href: '/user-management/users', icon: Users, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'Roles & Permissions', href: '/user-management/roles', icon: Shield, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Authentication', href: '/user-management/auth', icon: Lock, roles: ['superadmin'] },
      { name: 'Two-Factor Auth', href: '/user-management/2fa', icon: Shield, roles: ['superadmin', 'tenant_owner'] }
    ]
  },

  // Subscription & Payment Management - Superadmin and business owners
  { 
    name: 'Subscriptions', 
    href: '/subscriptions', 
    icon: CreditCard, 
    roles: ['superadmin', 'tenant_owner'],
    children: [
      { name: 'Plans & Pricing', href: '/subscriptions/plans', icon: Package, roles: ['superadmin'] },
      { name: 'Subscribers', href: '/subscriptions/subscribers', icon: Users, roles: ['superadmin'] },
      { name: 'Billing', href: '/subscriptions/billing', icon: CreditCard, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Invoices', href: '/subscriptions/invoices', icon: FileText, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Discounts', href: '/subscriptions/discounts', icon: Star, roles: ['superadmin'] }
    ]
  },

  // Multi-Tenancy Features
  { 
    name: 'Organizations', 
    href: '/organizations', 
    icon: Building, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'Tenants', href: '/organizations/tenants', icon: Building, roles: ['superadmin'] },
      { name: 'Team Management', href: '/organizations/teams', icon: Users, roles: ['tenant_owner', 'admin'] },
      { name: 'Outlets', href: '/organizations/outlets', icon: Store, roles: ['tenant_owner', 'admin'] }
    ]
  },

  // Content Management
  { 
    name: 'Content', 
    href: '/content', 
    icon: FileText, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'Blog Posts', href: '/content/blog', icon: FileText, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'Product Roadmap', href: '/content/roadmap', icon: Calendar, roles: ['superadmin'] },
      { name: 'FAQ Management', href: '/content/faq', icon: HelpCircle, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'Testimonials', href: '/content/testimonials', icon: Star, roles: ['superadmin', 'tenant_owner', 'admin'] }
    ]
  },

  // Communication & Email
  { 
    name: 'Communications', 
    href: '/communications', 
    icon: Mail, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'Email Templates', href: '/communications/templates', icon: Mail, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Email Campaigns', href: '/communications/campaigns', icon: Bell, roles: ['superadmin', 'tenant_owner', 'admin'] },
      { name: 'Notifications', href: '/communications/notifications', icon: Bell, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Support Chat', href: '/communications/chat', icon: MessageSquare, roles: ['superadmin', 'tenant_owner', 'admin'] }
    ]
  },

  // Customization & Branding - Business owners can customize their brand
  { 
    name: 'Branding', 
    href: '/branding', 
    icon: Palette, 
    roles: ['superadmin', 'tenant_owner'],
    children: [
      { name: 'Theme Settings', href: '/branding/theme', icon: Palette, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Logo & Assets', href: '/branding/assets', icon: Globe, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Custom Domain', href: '/branding/domain', icon: Globe, roles: ['superadmin', 'tenant_owner'] },
      { name: 'White Label', href: '/branding/white-label', icon: Settings, roles: ['superadmin'] }
    ]
  },

  // Advanced Features - Technical integrations
  { 
    name: 'Integrations', 
    href: '/integrations', 
    icon: Zap, 
    roles: ['superadmin', 'tenant_owner'],
    children: [
      { name: 'API Management', href: '/integrations/api', icon: Code, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Webhooks', href: '/integrations/webhooks', icon: Webhook, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Third-party Apps', href: '/integrations/apps', icon: Package, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Database', href: '/integrations/database', icon: Database, roles: ['superadmin'] }
    ]
  },

  // Settings
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    roles: ['superadmin', 'tenant_owner', 'admin'],
    children: [
      { name: 'General', href: '/settings/general', icon: Settings, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Security', href: '/settings/security', icon: Lock, roles: ['superadmin', 'tenant_owner'] },
      { name: 'SEO & Meta', href: '/settings/seo', icon: Globe, roles: ['superadmin', 'tenant_owner'] },
      { name: 'Backup & Export', href: '/settings/backup', icon: Database, roles: ['superadmin'] }
    ]
  }
];

const adminNavigation: NavItem[] = [
  { name: 'System Admin', href: '/admin', icon: Shield, roles: ['superadmin'] },
  { name: 'System Logs', href: '/admin/logs', icon: FileText, roles: ['superadmin'] },
  { name: 'Performance', href: '/admin/performance', icon: BarChart3, roles: ['superadmin'] }
];

export default function ComprehensiveSidebar() {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const canAccess = (item: NavItem) => {
    return item.roles.includes(user.role);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!canAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemClass = level === 0 ? 'px-2 py-2' : 'px-8 py-1.5';

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full group flex items-center ${itemClass} text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors`}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && (
              <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={({ isActive }) =>
          `group flex items-center ${itemClass} text-sm font-medium rounded-md transition-colors ${
            isActive
              ? 'bg-primary-700 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        {/* Logo Section */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">
                {user.role === 'superadmin' ? 'Superadmin Panel' :
                 user.role === 'tenant_owner' ? 'Business Dashboard' :
                 'Management Dashboard'}
              </h2>
              <p className="text-gray-400 text-xs">
                {user.role === 'superadmin' ? 'System-wide Control' :
                 user.role === 'tenant_owner' ? 'Business Management' :
                 'Team Management'}
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm font-medium">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'superadmin' ? 'bg-red-600 text-white' :
                  user.role === 'tenant_owner' ? 'bg-blue-600 text-white' :
                  user.role === 'admin' ? 'bg-green-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {user.role === 'superadmin' ? 'Superadmin' :
                   user.role === 'tenant_owner' ? 'Business Owner' :
                   user.role === 'admin' ? 'Admin' :
                   'Staff'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {saasNavigation.map(item => renderNavItem(item))}
            
            {/* Superadmin Section */}
            {user.role === 'superadmin' && (
              <>
                <div className="border-t border-gray-700 mt-6 pt-6">
                  <div className="px-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      System Administration
                    </span>
                  </div>
                  {adminNavigation.map(item => renderNavItem(item))}
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Info */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-900 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>Version 1.0.0</p>
            <p>© 2024 Admin Panel</p>
          </div>
        </div>
      </div>
    </div>
  );
}