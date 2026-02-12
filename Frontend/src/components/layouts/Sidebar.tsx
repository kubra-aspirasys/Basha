import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, FileText, CreditCard, MessageSquare, Bell, CircleUser as UserCircle, ChevronRight, X, Tag } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/offers', icon: Tag, label: 'Offers' },
  { to: '/admin/cms', icon: FileText, label: 'CMS' },
  { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 glass-effect border-r border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl premium-shadow">
                  <img src="/logo-min.webp" alt="Basha Biryani Logo" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Basha Biryani
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <ul className="space-y-1.5">
              {navItems.map((item, index) => (
                <li key={item.to} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                        ? 'gradient-primary text-white premium-shadow-lg scale-[1.02]'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:scale-[1.02] hover:premium-shadow'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${isActive
                              ? 'bg-white/20'
                              : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-gold-500/10'
                              }`}
                          >
                            <item.icon
                              className={`w-5 h-5 transition-all duration-300 ${isActive
                                ? 'text-white'
                                : 'text-slate-600 dark:text-slate-400 group-hover:text-gold-500'
                                }`}
                              strokeWidth={2.5}
                            />
                          </div>
                          <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-all duration-300 ${isActive
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                            }`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
