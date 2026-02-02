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
          {/* Animated background */}
          {isExpanded && (
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
              ? 'left-1 text-[#F2A900]'
              : 'left-0 text-gray-400 hover:text-[#F2A900] hover:scale-110 hover:bg-[#F2A900]/10'
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
            className={`w-full pl-12 pr-10 py-2.5 rounded-lg border-2 transition-all duration-400 bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none ${isExpanded
              ? 'border-[#F2A900] bg-[#0f0f0f] shadow-lg opacity-100'
              : 'border-transparent bg-transparent opacity-0 pointer-events-none'
              }`}
          />

          {/* Clear button - only visible when expanded and has text */}
          {isExpanded && query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 z-20 hover:scale-110 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown - appears when expanded and has query */}
      {isExpanded && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#F2A900]/30 rounded-lg overflow-hidden shadow-2xl z-50 transform transition-all duration-300 origin-top">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#F2A900]/30 scrollbar-track-transparent">
            {results.length > 0 ? (
              <>
                <div className="sticky top-0 px-4 py-3 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-[#F2A900]/10">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Results ({results.length})
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-[#F2A900]/10 rounded-lg transition-all duration-200 group hover:translate-x-1"
                      style={{ animation: `slideIn 0.3s ease-out ${idx * 50}ms both` }}
                    >
                      {result.icon && (
                        <img
                          src={result.icon}
                          alt={result.name}
                          className="w-10 h-10 rounded-md object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-[#F2A900] transition-colors">
                          {result.name}
                        </p>
                        {result.price && (
                          <p className="text-xs text-gray-400">{formatCurrency(result.price)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-500 opacity-50" />
                <p className="text-gray-400 font-medium">No dishes found</p>
                <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-[#F2A900]/10 bg-[#0f0f0f] text-xs text-gray-500">
            <p>
              Press <kbd className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#F2A900]/20 text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


