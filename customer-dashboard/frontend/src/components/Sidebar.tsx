import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Users, 
  Settings, 
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'staff'] },
  { name: 'Outlets', href: '/outlets', icon: Store, roles: ['owner', 'manager'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['owner'] },
  { name: 'Billing', href: '/billing', icon: CreditCard, roles: ['owner'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['owner', 'manager'] },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const canAccess = (item: typeof navigation[0]) => {
    return item.roles.includes(user.role);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              canAccess(item) && (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </NavLink>
              )
            ))}
            
            {/* Admin section */}
            {user.email === 'admin@example.com' && (
              <>
                <div className="border-t border-gray-700 mt-6 pt-6">
                  <div className="px-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Admin
                    </span>
                  </div>
                  {adminNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}