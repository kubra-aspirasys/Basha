import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Phone, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(212,165,116,0.06),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(212,165,116,0.05),transparent_30%)]">
      {/* Hero Section - Video Placeholder */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/75 to-[#0a0a0a]/90" />
        
        {/* Overlay Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 animate-slide-down">
            <span className="px-6 py-3 bg-[#d4a574]/10 border border-[#d4a574]/30 rounded-full text-[#d4a574] text-sm font-semibold uppercase tracking-widest">
              🔥 Hot for Every Friday
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-slide-up heading-glow">
            Basha Biryani
          </h1>
          
          <p className="text-xl md:text-3xl text-[#d4a574] mb-4 animate-slide-up animation-delay-200 font-light tracking-wide">
            Authentic Hyderabadi Flavors
          </p>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 animate-slide-up animation-delay-300">
            Experience the rich taste of traditional Hyderabadi cuisine with our signature BBQ kebabs, wraps, and delicacies
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up animation-delay-400">
            <Link to="/menu">
              <Button size="lg" className="bg-[#d4a574] hover:bg-[#c49564] text-black font-bold px-10 py-7 text-lg uppercase tracking-wider group">
                Order Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative animate-fade-in">
              <div className="relative z-10">
                <img 
                  src="/banner.jpeg" 
                  alt="Basha Biryani Special"
                  className="rounded-lg shadow-2xl w-full"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#d4a574]/10 rounded-full blur-3xl" />
            </div>

            {/* Content Side */}
            <div className="animate-fade-in animation-delay-200">
              <span className="text-[#d4a574] font-semibold text-sm uppercase tracking-widest mb-4 block">
                About Us
              </span>
              <h2 className="text-5xl font-bold text-white mb-6 heading-glow leading-tight">
                Authentic Hyderabadi
                <span className="block text-[#d4a574]">Biryani & BBQ</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                A savory haven for food lovers offering meticulously crafted dishes bursting with authentic Hyderabadi flavors. 
                From our signature BBQ kebabs to our aromatic biryanis, every dish tells a story of tradition and taste.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#d4a574]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#d4a574]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Fast Service</h4>
                    <p className="text-gray-500 text-sm">Quick delivery within 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#d4a574]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-[#d4a574]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Quality Food</h4>
                    <p className="text-gray-500 text-sm">Fresh ingredients daily</p>
                  </div>
                </div>
              </div>

              <Link to="/menu">
                <Button className="bg-[#d4a574] hover:bg-[#c49564] text-black font-bold px-8 py-6 uppercase tracking-wider">
                  View Menu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-[#d4a574] font-semibold text-sm uppercase tracking-widest mb-4 block">
              Our Specialties
            </span>
            <h2 className="text-5xl font-bold text-white mb-4 font-serif">
              Popular Menu
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our most loved dishes crafted with authentic spices
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'BBQ Kebabs', price: '₹100', desc: 'Juicy grilled perfection', image: '/banner.jpeg' },
              { name: 'Chicken Wraps', price: '₹120', desc: 'Flavored to perfection', image: '/banner.jpeg' },
              { name: 'Sausy Delicacies', price: '₹130', desc: 'Finger-licking good', image: '/banner.jpeg' },
              { name: 'Royal Desserts', price: '₹100', desc: 'Sweet traditional treats', image: '/banner.jpeg' },
            ].map((item, index) => (
              <div 
                key={index}
                className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                    <h3 className="text-white font-bold text-xl mb-2">{item.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[#d4a574] font-bold text-2xl">{item.price}</span>
                      <Button size="sm" className="bg-[#d4a574] hover:bg-[#c49564] text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in animation-delay-400">
            <Link to="/menu">
              <Button size="lg" className="bg-transparent border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#d4a574] hover:text-black font-bold px-10 py-6 uppercase tracking-wider">
                View Full Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
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
                <div className="w-20 h-20 bg-[#d4a574]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-10 h-10 text-[#d4a574]" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#d4a574] to-[#c49564] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-black rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-black rounded-full blur-2xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <h2 className="text-5xl font-bold text-black mb-6 font-serif">Ready to Order?</h2>
          <p className="text-2xl mb-10 text-black/80 font-light">Experience the authentic taste of Hyderabad</p>
          <Link to="/menu">
            <Button size="lg" className="bg-black hover:bg-black/90 text-white px-12 py-7 text-lg font-bold uppercase tracking-wider">
              Order Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

