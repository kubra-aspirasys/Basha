import { ArrowRight, Clock, Phone, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { useCartStore } from '@/store/cart-store';
import { MenuItem } from '@/types';
import MenuItemDetailModal from '@/components/MenuItemDetailModal';
import { formatCurrency } from '@/utils/orderCalculations';
import { categoryNames } from '@/lib/menu-mock-data';

export default function Home() {
  const { menuItems, fetchMenuItems } = useMenuStore();
  const { addItem } = useCartStore();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch menu items on mount
  useEffect(() => {
    if (!menuItems.length) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, menuItems.length]);

  // Get unique categories from menu items
  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category_id).filter(Boolean)))];

  // Get filtered items by category for new tabbed menu
  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems.filter(item => item.is_available)
    : menuItems.filter(item => item.category_id === selectedCategory && item.is_available);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleAddToCart = (quantity: number) => {
    if (selectedItem) {
      // Add items one by one based on quantity
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.discounted_price || selectedItem.price,
          image_url: selectedItem.image_url,
          unit_type: selectedItem.unit_type,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(212,165,116,0.06),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(212,165,116,0.05),transparent_30%)]">
      {/* Hero Section - Video Placeholder */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden w-full">
        {/* Hero video */}
        <video
          src="/Videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/70 via-[#0a0a0a]/70 t o-[#0a0a0a]/70" />

        {/* Overlay Content */}
        <div className="relative z-10 container mt-20 mx-auto px-4 sm:px-6 md:px-8 text-center md:text-left flex flex-col items-center md:items-start">

          <p className="text-lg md:text-xl text-[#F2A900] mb-6 animate-slide-up animation-delay-200 font-bold tracking-wide heading-glow">
            Spiced to Perfection, Served with Tradition!
          </p>

          <div className="bannerTextImg w-[200px] sm:w-[180px] md:w-[220px] lg:w-[250px] mb-6 animate-slide-up mx-auto md:mx-0">
            <img src="https://bashafood.in/Images/KING%20OF%20ALL%20FOOD.webp" alt="Banner Text" />
          </div>

          <p className="text-lg text-white max-w-2xl mb-4 animate-slide-up animation-delay-300">
            Experience the rich taste of traditional Hyderabad cuisine with our signature BBQ kababs, wraps, and desserts.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up animation-delay-400 w-full justify-center md:justify-start mt-4">
            <button
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#F2A900] hover:bg-[#D99700] text-black font-bold px-6 py-4 text-lg uppercase tracking-wider rounded-full transition-colors inline-flex items-center justify-center gap-2 group"
            >
              Order Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-[#0f0f0f] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative animate-fade-in">
              <div className="relative z-10 w-full max-w-[600px] aspect-square">
                <img
                  src="/AboutTikka.png"
                  alt="Basha Biryani Special"
                  className="rounded-lg shadow-2xl w-full h-[100%]"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F2A900]/10 rounded-full blur-3xl" />
            </div>

            {/* Content Side */}
            <div className="animate-fade-in animation-delay-200">
              <span className="text-[#F2A900] font-semibold text-sm uppercase tracking-widest mb-4 block">
                About Us
              </span>
              <h2 className="text-5xl font-display font-extrabold text-white mb-6 heading-glow leading-tight tracking-wide uppercase">
                Authentic Hyderabad
                <span className="block text-[#F2A900]">Biryani & BBQ</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                A savory haven for food lovers offering meticulously crafted dishes bursting with authentic Hyderabad flavors.
                From our signature BBQ kebabs to our aromatic biryanis, every dish tells a story of tradition and taste.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F2A900]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#F2A900]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Fast Service</h4>
                    <p className="text-gray-500 text-sm">Quick delivery within 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F2A900]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-[#F2A900]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Quality Food</h4>
                    <p className="text-gray-500 text-sm">Fresh ingredients daily</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F2A900] hover:bg-[#D99700] text-black font-bold px-8 py-4 uppercase tracking-wider rounded-full transition-colors inline-flex items-center gap-2"
              >
                View Menu
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hyderabad Heritage Section */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Centered Heading */}
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl md:text-5xl font-display font-extrabold text-white uppercase tracking-wider">
              Hydrabad Chicken Biryani
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Left: Biryani Video */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <video
                  src="/Videos/hero.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>

            {/* Center: Text Content */}
            <div className="text-center animate-fade-in animation-delay-200">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Hydrabad biryani (also known as Hydrabad dum biryani) originated from Golconda, Telangana India, made with basmati rice and meat.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Originating in the kitchens of the Qutub Shahi Kingdom. It combines the elements of Hydrabad and later on the Great Mughalai Cuisines.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Hydrabad biryani is a key dish flourished During the period of the 6th Nizam of Hydrabad Sir Mir Mehboob Ali Khan Asaf Jah and it is so famous that the dish is considered the city's signature dish.
              </p>
            </div>

            {/* Right: Overlaid Images - Nizam on top of Charminar */}
            <div className="hidden md:block relative h-[450px] animate-fade-in animation-delay-400 mt-8 lg:mt-0">
              {/* Charminar - Back layer */}
              <div className="absolute bottom-[80px] right-[80px] w-[307px] h-96">
                <img
                  src="/charminar.webp"
                  alt="Charminar - Hyderabad Heritage"
                  className="w-full h-full object-contain opacity-60"
                />
              </div>

              {/* Nizam - Front layer, positioned above */}
              <div className="absolute top-[80px] left-[80px] w-64 h-80">
                <img
                  src="/nizam.webp"
                  alt="Nizam of Hyderabad"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Full Menu with Category Tabs */}
      <section id="menu-section" className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-[#F2A900] font-semibold text-sm uppercase tracking-widest mb-4 block">
              Our Menu
            </span>
            <h2 className="text-5xl font-display font-extrabold text-white mb-4 tracking-wide uppercase">
              Explore Our Delicious Menu
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose from our wide range of authentic Hyderabad dishes
            </p>
          </div>

          {/* Category Tabs - Horizontal scroll on mobile, wrapped on desktop */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
            <div className="flex gap-2 sm:gap-4 sm:flex-wrap sm:justify-center mb-8 sm:mb-12 animate-fade-in animation-delay-100 min-w-max sm:min-w-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category || 'all')}
                  className={`px-4 py-2 sm:px-8 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${selectedCategory === category
                    ? 'bg-[#F2A900] text-black shadow-lg scale-105'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#F2A900]/20 hover:border-[#F2A900]/40'
                    }`}
                >
                  {category === 'all' ? 'All' : (categoryNames[category as keyof typeof categoryNames] || category)}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid - Mobile App Style on small screens, Grid on larger */}
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
            {filteredMenuItems.length > 0 ? filteredMenuItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in cursor-pointer border border-[#F2A900]/10 hover:border-[#F2A900]/30 
                  flex flex-row sm:flex-col"
                style={{ animationDelay: `${(index % 12) * 50}ms` }}
              >
                {/* Image Container - Square thumbnail on mobile, full width on desktop */}
                <div className="relative w-28 h-28 flex-shrink-0 sm:w-full sm:h-56 overflow-hidden">
                  <img
                    src={item.image_url || '/banner.jpeg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 hidden sm:block" />

                  {/* Discount Badge - Only show on desktop view */}
                  {item.offer_discount_value && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      {item.offer_discount_type === 'percentage' ? `${item.offer_discount_value}% OFF` : `₹${item.offer_discount_value} OFF`}
                    </div>
                  )}

                  {/* Featured Badge - Only show on desktop view */}
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#F2A900] text-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      ⭐ Featured
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{item.description || 'Authentic Hyderabad taste'}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-[#F2A900] font-bold text-lg sm:text-2xl">{formatCurrency(item.discounted_price || item.price)}</span>
                      {item.discounted_price && (
                        <span className="text-gray-500 text-xs sm:text-sm line-through">{formatCurrency(item.price)}</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-[10px] sm:text-xs">per {item.unit_type}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg">No items available in this category</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Fast Delivery', desc: 'Quick takeaway and delivery within 30 minutes' },
              { icon: Phone, title: 'Easy Ordering', desc: 'Order online or call us at 70109 33658' },
              { icon: MapPin, title: 'Find Us', desc: 'Kaka Chandamiyan Street, Ambur' },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-10 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-20 h-20 bg-[#F2A900]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-10 h-10 text-[#F2A900]" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Biryani @ Basha */}
      <section className="py-32 bg-[#f5f5f5] relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          {/* Main Heading with Outline Style */}
          <h2 className="text-5xl md:text-8xl font-display font-extrabold mb-8 tracking-wider uppercase"
            style={{
              WebkitTextStroke: '2px #000',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              fontFamily: "'Bebas Neue', sans-serif"
            }}>
            Biryani @ Basha
          </h2>

          {/* Tagline */}
          <p className="text-3xl md:text-4xl mb-12 text-gray-600 font-semibold tracking-[0.3em]">
            ORDER........ EAT........ REPEAT
          </p>

          {/* Order Now Button */}
          <button
            onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-bold uppercase tracking-wider rounded-full transition-colors inline-flex items-center gap-2"
          >
            Order Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Menu Item Detail Modal */}
      {selectedItem && (
        <MenuItemDetailModal
          item={selectedItem}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}



