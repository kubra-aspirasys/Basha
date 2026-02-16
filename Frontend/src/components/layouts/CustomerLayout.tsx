import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { ShoppingCart, User, Menu as MenuIcon, X, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import GlobalSearch from '@/components/GlobalSearch';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

export default function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect admin to admin panel if they try to access customer routes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // On homepage, scroll to menu section
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On other pages, navigate to homepage and then scroll
      navigate('/');
      setTimeout(() => {
        document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <div data-customer-layout className="min-h-screen flex flex-col bg-[#0a0a0a] bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(212,165,116,0.06),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(212,165,116,0.05),transparent_30%)]">

      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#F2A900]/15 shadow-[0_10px_40px_rgba(0,0,0,0.4)]' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <img src="/logo-min.webp" alt="Basha Biryani" className="h-16 w-auto group-hover:scale-110 transition-transform" />
            </Link>

            {/* Centered Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md">
              <GlobalSearch />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-[#F2A900] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Home
              </Link>
              <button onClick={handleMenuClick} className="text-white hover:text-[#F2A900] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Menu
              </button>
              <Link to="/orders" className="text-white hover:text-[#F2A900] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Orders
              </Link>
              <Link to="/contact" className="text-white hover:text-[#F2A900] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Contact
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* Mobile Search - Integrated */}
              <div className="lg:hidden">
                <GlobalSearch />
              </div>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 text-white hover:text-[#F2A900] transition-colors hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F2A900] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu Dropdown */}
              <div className="hidden md:block relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-white hover:text-[#F2A900] transition-colors hover:scale-110"
                >
                  <User className="w-6 h-6" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#F2A900]/30 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-white hover:bg-[#F2A900]/10 hover:text-[#F2A900] transition-colors"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-white hover:bg-[#F2A900]/10 hover:text-[#F2A900] transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-[#F2A900] hover:bg-[#F2A900]/10 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#F2A900] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>


        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1a1a] border-t border-[#2a2a2a]">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <Link to="/" className="py-2 text-white hover:text-[#F2A900] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <button onClick={handleMenuClick} className="py-2 text-left text-white hover:text-[#F2A900] uppercase text-sm">
                Menu
              </button>
              <Link to="/orders" className="py-2 text-white hover:text-[#F2A900] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/contact" className="py-2 text-white hover:text-[#F2A900] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="py-2 text-white hover:text-[#F2A900] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="py-2 text-left text-red-400 uppercase text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2 text-[#F2A900] font-semibold uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                  Login / Sign Up
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-[#F2A900] text-xl font-bold mb-4">Basha Biryani</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Authentic Hyderabad flavors crafted with traditional spices and recipes passed down through generations.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#F2A900] text-white flex items-center justify-center rounded-full transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#F2A900] text-white flex items-center justify-center rounded-full transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#F2A900] text-white flex items-center justify-center rounded-full transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#F2A900] text-white flex items-center justify-center rounded-full transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-[#F2A900] transition-colors text-sm">Home</Link>
                <Link to="/menu" className="block text-gray-400 hover:text-[#F2A900] transition-colors text-sm">Menu</Link>
                <Link to="/orders" className="block text-gray-400 hover:text-[#F2A900] transition-colors text-sm">My Orders</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-[#F2A900] transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-[#F2A900] flex-shrink-0 mt-0.5" />
                  <span>Next Street to Ambur Court, Near Old State Bank, Kaka Chandamiyan Street Ambur 635 802</span>
                </div>
                <a href="tel:7010933658" className="flex items-center gap-3 text-gray-400 hover:text-[#F2A900] transition-colors">
                  <Phone className="w-5 h-5 text-[#F2A900] flex-shrink-0" />
                  <span>70109 33658</span>
                </a>
                <a href="mailto:info@bashabiryani.com" className="flex items-center gap-3 text-gray-400 hover:text-[#F2A900] transition-colors">
                  <Mail className="w-5 h-5 text-[#F2A900] flex-shrink-0" />
                  <span>info@bashabiryani.com</span>
                </a>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Opening Hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Monday - Sunday</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                  <p className="text-[#F2A900] font-semibold">We're Open Daily!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#2a2a2a]">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© 2026 Basha Biryani. Crafted with spice.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-[#F2A900] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#F2A900] transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        variant="customer"
      />
    </div>
  );
}


