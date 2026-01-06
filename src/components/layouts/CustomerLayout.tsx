import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu as MenuIcon, X, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

export default function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(212,165,116,0.06),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(212,165,116,0.05),transparent_30%)]">

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#d4a574]/15 shadow-[0_10px_40px_rgba(0,0,0,0.4)]' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/logo-min.webp" alt="Basha Biryani" className="h-14 w-auto group-hover:scale-110 transition-transform" />
              <div>
                <h1 className="text-2xl font-bold text-[#d4a574]">Basha</h1>
                <p className="text-xs text-gray-400 tracking-wider">BIRYANI</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-[#d4a574] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Home
              </Link>
              <Link to="/menu" className="text-white hover:text-[#d4a574] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Menu
              </Link>
              <Link to="/orders" className="text-white hover:text-[#d4a574] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Orders
              </Link>
              <Link to="/contact" className="text-white hover:text-[#d4a574] transition-colors font-semibold text-sm uppercase tracking-[0.2em]">
                Contact
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-2 text-white hover:text-[#d4a574] transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4a574] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Book Table Button */}
              <Link to="/contact" className="hidden md:block">
                <Button className="bg-[#d4a574] hover:bg-[#c49564] text-black font-semibold px-6 uppercase text-sm tracking-wide">
                  Book A Table
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" className="text-white hover:text-[#d4a574] hover:bg-transparent">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="hidden md:block">
                  <Button variant="ghost" className="text-white hover:text-[#d4a574] hover:bg-transparent">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-[#d4a574] transition-colors"
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
              <Link to="/" className="py-2 text-white hover:text-[#d4a574] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/menu" className="py-2 text-white hover:text-[#d4a574] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Menu
              </Link>
              <Link to="/orders" className="py-2 text-white hover:text-[#d4a574] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/contact" className="py-2 text-white hover:text-[#d4a574] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="py-2 text-white hover:text-[#d4a574] uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="py-2 text-left text-red-400 uppercase text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2 text-[#d4a574] font-semibold uppercase text-sm" onClick={() => setMobileMenuOpen(false)}>
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
              <h3 className="text-[#d4a574] text-xl font-bold mb-4">Basha Biryani</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Authentic Hyderabadi flavors crafted with traditional spices and recipes passed down through generations.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#d4a574] text-white flex items-center justify-center rounded-full transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#d4a574] text-white flex items-center justify-center rounded-full transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#d4a574] text-white flex items-center justify-center rounded-full transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#d4a574] text-white flex items-center justify-center rounded-full transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-[#d4a574] transition-colors text-sm">Home</Link>
                <Link to="/menu" className="block text-gray-400 hover:text-[#d4a574] transition-colors text-sm">Menu</Link>
                <Link to="/orders" className="block text-gray-400 hover:text-[#d4a574] transition-colors text-sm">My Orders</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-[#d4a574] transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-0.5" />
                  <span>Next Street to Ambur Court, Near Old State Bank, Kaka Chandamiyan Street Ambur 635 802</span>
                </div>
                <a href="tel:7010933658" className="flex items-center gap-3 text-gray-400 hover:text-[#d4a574] transition-colors">
                  <Phone className="w-5 h-5 text-[#d4a574] flex-shrink-0" />
                  <span>70109 33658</span>
                </a>
                <a href="mailto:info@bashabiryani.com" className="flex items-center gap-3 text-gray-400 hover:text-[#d4a574] transition-colors">
                  <Mail className="w-5 h-5 text-[#d4a574] flex-shrink-0" />
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
                  <p className="text-[#d4a574] font-semibold">We're Open Daily!</p>
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
                <a href="#" className="hover:text-[#d4a574] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#d4a574] transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
