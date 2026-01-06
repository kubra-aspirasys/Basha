import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, UtensilsCrossed, ShoppingBag, MessageSquare, CreditCard, Tag } from 'lucide-react';
import { useCustomerStore } from '@/store/customer-store';
import { useMenuStore } from '@/store/menu-store';
import { useOrderStore } from '@/store/order-store';
import { useInquiryStore } from '@/store/inquiry-store';
import { usePaymentStore } from '@/store/payment-store';
import { useOfferStore } from '@/store/offer-store';

interface SearchResult {
    id: string;
    type: 'customer' | 'menu' | 'order' | 'inquiry' | 'payment' | 'offer';
    title: string;
    subtitle: string;
    icon: any;
    route: string;
    data: any;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, searchQuery, onSearchQueryChange }: GlobalSearchProps) {
    const navigate = useNavigate();
    const customers = useCustomerStore((state) => state.customers);
    const menuItems = useMenuStore((state) => state.menuItems);
    const orders = useOrderStore((state) => state.orders);
    const inquiries = useInquiryStore((state) => state.inquiries);
    const payments = usePaymentStore((state) => state.payments);
    const offers = useOfferStore((state) => state.offers);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Search Customers
        customers.forEach(customer => {
            if (
                customer.name.toLowerCase().includes(query) ||
                customer.email.toLowerCase().includes(query) ||
                customer.phone?.includes(query) ||
                customer.address?.toLowerCase().includes(query)
            ) {
                results.push({
                    id: customer.id,
                    type: 'customer',
                    title: customer.name,
                    subtitle: `${customer.email} • ${customer.phone || 'No phone'}`,
                    icon: Users,
                    route: '/admin/users',
                    data: customer
                });
            }
        });

        // Search Menu Items
        menuItems.forEach(item => {
            if (
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category_id?.toLowerCase().includes(query)
            ) {
                results.push({
                    id: item.id,
                    type: 'menu',
                    title: item.name,
                    subtitle: `₹${item.price} • ${item.category_id || 'No category'}`,
                    icon: UtensilsCrossed,
                    route: '/admin/menu',
                    data: item
                });
            }
        });

        // Search Orders
        orders.forEach(order => {
            if (
                order.order_number.toLowerCase().includes(query) ||
                order.customer_name.toLowerCase().includes(query) ||
                order.delivery_address?.toLowerCase().includes(query)
            ) {
                results.push({
                    id: order.id,
                    type: 'order',
                    title: order.order_number,
                    subtitle: `${order.customer_name} • ₹${order.total_amount}`,
                    icon: ShoppingBag,
                    route: '/admin/orders',
                    data: order
                });
            }
        });

        // Search Inquiries
        inquiries.forEach(inquiry => {
            if (
                inquiry.full_name.toLowerCase().includes(query) ||
                inquiry.email?.toLowerCase().includes(query) ||
                inquiry.phone?.includes(query) ||
                inquiry.event_type?.toLowerCase().includes(query) ||
                inquiry.event_date?.toLowerCase().includes(query)
            ) {
                results.push({
                    id: inquiry.id,
                    type: 'inquiry',
                    title: inquiry.full_name,
                    subtitle: `${inquiry.event_type} • ${inquiry.event_date}`,
                    icon: MessageSquare,
                    route: '/admin/inquiries',
                    data: inquiry
                });
            }
        });

        // Search Payments
        payments.forEach(payment => {
            if (
                payment.transaction_id.toLowerCase().includes(query) ||
                payment.customer_name.toLowerCase().includes(query) ||
                payment.payment_mode.toLowerCase().includes(query)
            ) {
                results.push({
                    id: payment.id,
                    type: 'payment',
                    title: payment.transaction_id,
                    subtitle: `${payment.customer_name} • ₹${payment.amount} • ${payment.payment_mode}`,
                    icon: CreditCard,
                    route: '/admin/payments',
                    data: payment
                });
            }
        });

        // Search Offers
        offers.forEach(offer => {
            if (
                offer.code.toLowerCase().includes(query) ||
                offer.discount_type.toLowerCase().includes(query)
            ) {
                results.push({
                    id: offer.id,
                    type: 'offer',
                    title: offer.code,
                    subtitle: `${offer.discount_type} • ${offer.discount_value}${offer.discount_type === 'percentage' ? '%' : '₹'}`,
                    icon: Tag,
                    route: '/admin/offers',
                    data: offer
                });
            }
        });

        // Sort results by type and relevance
        return results.sort((a, b) => {
            // First sort by type
            const typeOrder = ['customer', 'order', 'menu', 'inquiry', 'payment', 'offer'];
            const aTypeIndex = typeOrder.indexOf(a.type);
            const bTypeIndex = typeOrder.indexOf(b.type);

            if (aTypeIndex !== bTypeIndex) {
                return aTypeIndex - bTypeIndex;
            }

            // Then sort by title relevance
            const aTitleMatch = a.title.toLowerCase().startsWith(query);
            const bTitleMatch = b.title.toLowerCase().startsWith(query);

            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;

            return a.title.localeCompare(b.title);
        });
    }, [searchQuery, customers, menuItems, orders, inquiries, payments, offers]);

    const handleResultClick = (result: SearchResult) => {
        navigate(result.route);
        onClose();
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            customer: 'Customers',
            menu: 'Menu Items',
            order: 'Orders',
            inquiry: 'Inquiries',
            payment: 'Payments',
            offer: 'Offers'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            customer: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
            menu: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
            order: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300',
            inquiry: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
            payment: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300',
            offer: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300'
        };
        return colors[type as keyof typeof colors] || 'text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-300';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                placeholder="Search customers, menu items, orders, inquiries, payments, offers..."
                                className="w-full pl-10 pr-4 py-3 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {searchQuery.trim() && searchResults.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No results found</p>
                            <p className="text-sm">Try searching for customers, menu items, orders, or other data</p>
                        </div>
                    ) : searchQuery.trim() ? (
                        <div className="p-2">
                            {Object.entries(
                                searchResults.reduce((acc, result) => {
                                    if (!acc[result.type]) acc[result.type] = [];
                                    acc[result.type].push(result);
                                    return acc;
                                }, {} as Record<string, SearchResult[]>)
                            ).map(([type, results]) => (
                                <div key={type} className="mb-4">
                                    <div className="flex items-center gap-2 px-3 py-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                                            {getTypeLabel(type)}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {results.length} result{results.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {results.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                            >
                                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                                    <result.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                                        {result.title}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                        {result.subtitle}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {getTypeLabel(result.type)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Search Everything</p>
                            <p className="text-sm">Search across customers, menu items, orders, inquiries, payments, and offers</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-4">
                            <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Esc</kbd> to close</span>
                        </div>
                        <div>
                            {searchQuery.trim() && `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
