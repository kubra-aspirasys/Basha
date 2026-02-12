import { useState, useEffect } from 'react';
import { useOfferStore } from '@/store/offer-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Offers() {
  const { offers, addOffer, updateOffer, deleteOffer, fetchOffers } = useOfferStore();

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    valid_from: '',
    valid_to: '',
    is_active: true,
  });
  const { toast } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateOffer(editingOffer, {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
      });
      toast({
        title: 'Offer updated',
        description: 'The offer has been updated successfully',
      });
    } else {
      addOffer({
        ...formData,
        discount_value: parseFloat(formData.discount_value),
      });
      toast({
        title: 'Offer added',
        description: 'The offer has been added successfully',
      });
    }
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      valid_from: '',
      valid_to: '',
      is_active: true,
    });
    setEditingOffer(null);
  };

  // Date filtering helper
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { from: weekStart, to: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { from: monthStart, to: monthEnd };
      case 'custom':
        return {
          from: customDateFrom ? new Date(customDateFrom) : null,
          to: customDateTo ? new Date(customDateTo) : null
        };
      default:
        return null;
    }
  };

  // Helper function to determine offer status
  const getOfferStatus = (offer: any) => {
    if (!offer.is_active) return 'inactive';
    const now = new Date();
    const validTo = new Date(offer.valid_to);
    if (now > validTo) return 'expired';
    return 'active';
  };

  const filteredOffers = offers.filter((offer) => {
    // Search filter
    const matchesSearch = offer.code.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = typeFilter === 'all' || offer.discount_type === typeFilter;

    // Status filter
    const offerStatus = getOfferStatus(offer);
    const matchesStatus = statusFilter === 'all' || offerStatus === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const offerDate = new Date(offer.valid_from);
        if (dateRange.from && offerDate < dateRange.from) matchesDate = false;
        if (dateRange.to && offerDate >= dateRange.to) matchesDate = false;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const clearAllFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
  };

  const handleEdit = (offer: typeof offers[0]) => {
    setFormData({
      code: offer.code,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(),
      valid_from: offer.valid_from.split('T')[0],
      valid_to: offer.valid_to.split('T')[0],
      is_active: offer.is_active,
    });
    setEditingOffer(offer.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete offer "${code}"?`)) {
      deleteOffer(id);
      toast({
        title: 'Offer deleted',
        description: 'The offer has been deleted successfully',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Offers</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage discount codes and promotional offers
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Edit Offer' : 'Add New Offer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Offer Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., WELCOME50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_to">Valid To</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={formData.valid_to}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, valid_to: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto">
                  {editingOffer ? 'Update' : 'Add'} Offer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 flex-1 sm:flex-none"
                >
                  Filters
                </Button>
                {(typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="px-4 py-2 border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {/* Offer Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Offer Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'expired')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredOffers.length} of {offers.length} offers
                {(typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                  <span className="text-slate-500 dark:text-slate-500"> (filtered)</span>
                )}
              </span>
            </div>

            {/* Active Filters Summary */}
            {(typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
              <div className="flex flex-wrap gap-2">
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                    Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                    <button
                      onClick={() => setTypeFilter('all')}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm">
                    Date: {dateFilter === 'custom' ? 'Custom Range' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                    <button
                      onClick={() => setDateFilter('all')}
                      className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium font-mono">
                      {offer.code}
                    </TableCell>
                    <TableCell>
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}%`
                        : `₹${offer.discount_value}`}
                    </TableCell>
                    <TableCell>
                      {new Date(offer.valid_from).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(offer.valid_to).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {offer.is_active ? (
                        <Badge className="bg-success/10 text-success dark:bg-success/20 dark:text-success">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(offer)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(offer.id, offer.code)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Header with Code and Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white font-mono text-lg">
                        {offer.code}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {offer.discount_type === 'percentage'
                          ? `${offer.discount_value}% off`
                          : `₹${offer.discount_value} off`}
                      </p>
                    </div>
                    <div>
                      {offer.is_active ? (
                        <Badge className="bg-success/10 text-success dark:bg-success/20 dark:text-success">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  {/* Validity Period */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Valid From:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(offer.valid_from).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Valid To:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(offer.valid_to).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(offer)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(offer.id, offer.code)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
