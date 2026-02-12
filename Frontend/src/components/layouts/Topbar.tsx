import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, LogOut, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore, Notification } from '@/store/notification-store';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import GlobalSearch from '../GlobalSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  // const { toast } = useToast();
  const { latestUnread, unreadCount, fetchLatestUnread, markAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchLatestUnread();

    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchLatestUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchProfile, fetchLatestUnread]);

  const admin = user && user.role === 'admin' ? user : null;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/admin/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleReadAndNavigate = async (notification: Notification) => {
    await markAsRead(notification.id);
    setShowNotifications(false);

    // Smart redirection based on notification type
    switch (notification.type) {
      case 'new_order':
      case 'order_status':
      case 'order_cancelled':
        navigate('/admin/orders');
        break;
      case 'new_payment':
      case 'payment_failed':
        navigate('/admin/payments');
        break;
      case 'new_customer':
        navigate('/admin/users');
        break;
      case 'new_inquiry':
      case 'new_quote':
      case 'contact_message':
        navigate('/admin/inquiries');
        break;
      case 'low_stock':
        navigate('/admin/menu');
        break;
      default:
        navigate('/admin/notifications');
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Search bar will handle this through focus
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="h-24 glass-effect border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl px-3 sm:px-4 lg:px-8 flex items-center justify-between premium-shadow relative z-[10000]">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0 max-w-2xl hidden sm:block">
            <h1 className="text-sm sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent truncate">
              Welcome, {admin?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="hidden md:block text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Here's what's happening with your restaurant today
            </p>
          </div>
        </div>

        {/* Centered Search Bar - only icon shows until hover/focus */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <GlobalSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 ml-auto lg:ml-0">
          <div className="md:hidden">
            <GlobalSearch />
          </div>
          {/* Notifications */}
          <div className="relative group" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:premium-shadow relative"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-[9999] overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-white bg-error px-1.5 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {latestUnread.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    latestUnread.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleReadAndNavigate(notification)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{notification.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/admin/notifications'); }}
                    className="w-full text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:premium-shadow"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
            )}
          </button>

          <div className="hidden md:block w-px h-8 bg-slate-300 dark:bg-slate-700" />

          <div
            className="hidden md:flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-3 pr-3 lg:pr-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:premium-shadow group"
            onClick={() => navigate('/admin/profile')}
          >
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <Avatar className="relative w-8 lg:w-10 h-8 lg:h-10 rounded-full premium-shadow border-2 border-white dark:border-slate-800">
                <AvatarImage src={admin?.avatar_url} alt={admin?.name} />
                <AvatarFallback className="gradient-primary text-white font-bold text-xs lg:text-sm">
                  {admin?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 lg:w-3.5 h-3 lg:h-3.5 bg-success rounded-full border-2 border-white dark:border-slate-800" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                {admin?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 lg:p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-error dark:text-red-400 transition-all duration-300 hover:scale-105 hover:premium-shadow group"
          >
            <LogOut className="w-4 lg:w-5 h-4 lg:h-5 group-hover:rotate-6 transition-transform" strokeWidth={2.5} />
          </button>
        </div>

      </header>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        variant="admin"
      />
    </>
  );
}
