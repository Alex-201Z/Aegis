import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Bell,
  MonitorSmartphone,
  MessageSquare,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/assets', icon: MonitorSmartphone, label: 'Assets' },
  { to: '/assistant', icon: MessageSquare, label: 'Assistant' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const alerts = useSecurityStore((state) => state.alerts);

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-aegis-darker bg-grid">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-aegis-dark/95 backdrop-blur border-b border-aegis-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-aegis-primary" />
            <span className="text-xl font-bold text-gradient">Aegis</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-aegis-dark/95 backdrop-blur border-r border-aegis-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-aegis-border">
            <Shield className="w-10 h-10 text-aegis-primary" />
            <div>
              <h1 className="text-xl font-bold text-gradient">Aegis</h1>
              <p className="text-xs text-gray-500">Digital Sentinel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-aegis-primary/10 text-aegis-primary border border-aegis-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-aegis-card'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.to === '/alerts' && unreadAlerts > 0 && (
                  <span className="ml-auto bg-aegis-danger text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadAlerts}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-aegis-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-aegis-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-aegis-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.rank || 'Novice'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-aegis-danger transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
