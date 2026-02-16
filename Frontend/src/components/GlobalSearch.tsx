import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useMenuStore } from '@/store/menu-store';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '@/utils/orderCalculations';

interface SearchResult {
  id: string;
  name: string;
  type: 'menu' | 'category';
  icon?: string;
  href?: string;
  price?: number;
}

// Helper to construct full image URL
const getImageUrl = (url?: string) => {
  if (!url) return '/banner.jpeg'; // Fallback
  if (url.startsWith('http')) return url;
  // Remove /api from base if present to get root
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}${url}`;
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItems, fetchMenuItems } = useMenuStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdminPath = location.pathname.startsWith('/admin');
  const [isFocused, setIsFocused] = useState(false);

  // Fetch menu items if not loaded
  useEffect(() => {
    if (!menuItems.length) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, menuItems.length]);

  // Close search when clicking outside (always collapse)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [query]);

  // Search functionality with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const searchQuery = query.toLowerCase();
      const menuResults = menuItems
        .filter(
          (item) =>
            item.is_available &&
            (item.name.toLowerCase().includes(searchQuery) ||
              item.description?.toLowerCase().includes(searchQuery))
        )
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          name: item.name,
          type: 'menu' as const,
          icon: item.image_url,
          price: item.price,
        }));

      setResults(menuResults);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, menuItems]);

  // Handle hover to expand
  const handleMouseEnter = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle mouse leave to collapse (only if no query AND not focused)
  const handleMouseLeave = () => {
    if (!query.trim() && !isFocused) {
      setIsExpanded(false);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (isAdminPath) {
      navigate(`/admin/menu?search=${encodeURIComponent(result.name)}`);
    } else {
      navigate(`/menu?search=${encodeURIComponent(result.name)}`);
    }
    setIsExpanded(false);
    setQuery('');
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };



  return (
    <div
      ref={searchRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Collapsible Search Bar */}
      <div
        className={`relative transition-all duration-400 ease-out overflow-hidden ${isExpanded ? 'w-40 lg:w-full' : 'w-10'
          }`}
      >
        <div className="relative">
          {/* Animated background - Only for Customer side */}
          {isExpanded && !isAdminPath && (
            <>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#F2A900]/10 via-transparent to-[#F2A900]/5 animate-pulse" />
            </>
          )}

          {/* Search Icon Button */}
          <button
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseEnter}
            className={`absolute top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all duration-400 z-20 flex-shrink-0 ${isExpanded
              ? isAdminPath ? 'left-1 text-slate-500' : 'left-1 text-[#F2A900]'
              : isAdminPath ? 'left-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'left-0 text-gray-400 hover:text-[#F2A900] hover:scale-110 hover:bg-[#F2A900]/10'
              }`}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Input field - expands from right */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setIsFocused(true); setIsExpanded(true); }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search dishes..."
            className={`w-full pl-12 pr-10 py-2.5 rounded-lg border-2 transition-all duration-400 focus:outline-none ${isAdminPath
              ? `bg-slate-50 text-slate-900 placeholder-slate-400 ${isExpanded ? 'border-slate-200 focus:bg-white focus:border-primary shadow-sm opacity-100' : 'border-transparent bg-transparent opacity-0 pointer-events-none'}`
              : `bg-[#1a1a1a] text-white placeholder-gray-500 ${isExpanded ? 'border-[#F2A900] bg-[#0f0f0f] shadow-lg opacity-100' : 'border-transparent bg-transparent opacity-0 pointer-events-none'}`
              }`}
          />

          {/* Clear button - only visible when expanded and has text */}
          {isExpanded && query && (
            <button
              onClick={handleClear}
              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 z-20 hover:scale-110 active:scale-95 ${isAdminPath ? 'text-slate-400 hover:text-slate-600' : 'text-gray-400 hover:text-white'
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown - appears when expanded and has query */}
      {isExpanded && query && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden shadow-2xl z-50 transform transition-all duration-300 origin-top ${isAdminPath
          ? 'bg-white border border-slate-200 text-slate-900'
          : 'bg-[#1a1a1a] border border-[#F2A900]/30 text-white'
          }`}>
          <div className={`max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent ${isAdminPath ? 'scrollbar-thumb-slate-200' : 'scrollbar-thumb-[#F2A900]/30'
            }`}>
            {results.length > 0 ? (
              <>
                <div className={`sticky top-0 px-4 py-3 backdrop-blur-sm border-b ${isAdminPath
                  ? 'bg-white/90 border-slate-100'
                  : 'bg-[#0f0f0f]/80 border-[#F2A900]/10'
                  }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isAdminPath ? 'text-slate-500' : 'text-gray-400'
                    }`}>
                    Results ({results.length})
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left px-3 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 group hover:translate-x-1 ${isAdminPath
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-primary'
                        : 'hover:bg-[#F2A900]/10 text-white hover:text-[#F2A900]'
                        }`}
                      style={{ animation: `slideIn 0.3s ease-out ${idx * 50}ms both` }}
                    >
                      <img
                        src={getImageUrl(result.icon)}
                        alt={result.name}
                        className="w-10 h-10 rounded-md object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = '/banner.jpeg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate transition-colors ${isAdminPath ? 'text-slate-900 group-hover:text-primary' : 'text-white group-hover:text-[#F2A900]'
                          }`}>
                          {result.name}
                        </p>
                        {result.price && (
                          <p className={`text-xs ${isAdminPath ? 'text-slate-500' : 'text-gray-400'
                            }`}>{formatCurrency(result.price)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Search className={`w-10 h-10 mx-auto mb-3 opacity-50 ${isAdminPath ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                <p className={`font-medium ${isAdminPath ? 'text-slate-600' : 'text-gray-400'
                  }`}>No dishes found</p>
                <p className={`text-xs mt-1 ${isAdminPath ? 'text-slate-400' : 'text-gray-500'
                  }`}>Try different keywords</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-xs ${isAdminPath
            ? 'bg-slate-50 border-slate-100 text-slate-500'
            : 'bg-[#0f0f0f] border-[#F2A900]/10 text-gray-500'
            }`}>
            <p>
              Press <kbd className={`px-2 py-1 rounded border text-[10px] ${isAdminPath
                ? 'bg-white border-slate-200 text-slate-500'
                : 'bg-[#1a1a1a] border-[#F2A900]/20 text-gray-400'
                }`}>Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



