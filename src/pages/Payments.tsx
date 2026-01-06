import { useState } from 'react';
import { usePaymentStore } from '@/store/payment-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Download, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';

const paymentModeColors = {
  cash: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  upi: 'bg-gold-500/10 text-gold-600 dark:bg-gold-500/20 dark:text-gold-400',
};

const statusColors = {
  pending: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  completed: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  failed: 'bg-error/10 text-error dark:bg-error/20 dark:text-error',
};

// Add Payment Modal Component
function AddPaymentModal() {
  const { addPayment } = usePaymentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: '',
    customer_name: '',
    amount: '',
    payment_mode: 'cash' as Payment['payment_mode'],
    status: 'completed' as Payment['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      transaction_id: formData.transaction_id,
      order_id: '', // Default empty order_id
      customer_id: '', // Default empty customer_id
      customer_name: formData.customer_name,
      amount: parseFloat(formData.amount),
      payment_mode: formData.payment_mode,
      status: formData.status,
    };

    addPayment(paymentData);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      transaction_id: '',
      customer_name: '',
      amount: '',
      payment_mode: 'cash',
      status: 'completed',
    });
  };

  // Generate transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID *
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="Enter transaction ID"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ ...formData, transaction_id: generateTransactionId() })}
                className="px-3"
              >
                Generate
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Customer Name *
            </label>
            <Input
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹) *
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Mode *
            </label>
            <select
              value={formData.payment_mode}
              onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as Payment['payment_mode'] })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Payment
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Payments() {
  const payments = usePaymentStore((state) => state.payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  // Filter states
  const [modeFilter, setModeFilter] = useState<'all' | 'cash' | 'upi'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const matchesSearch = payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Mode filter
    const matchesMode = modeFilter === 'all' || payment.payment_mode === modeFilter;

    // Status filter
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const paymentDate = new Date(payment.created_at);
        if (dateRange.from && paymentDate < dateRange.from) matchesDate = false;
        if (dateRange.to && paymentDate >= dateRange.to) matchesDate = false;
      }
    }

    return matchesSearch && matchesMode && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const totalAmount = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Amount', 'Payment Mode', 'Status', 'Date'];
    const rows = filteredPayments.map((payment) => [
      payment.transaction_id,
      payment.customer_name,
      payment.amount,
      payment.payment_mode,
      payment.status,
      new Date(payment.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'Export successful',
      description: 'Payment data has been exported to CSV',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearAllFilters = () => {
    setModeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage payment transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <AddPaymentModal />
          <Button
            onClick={handleExportCSV}
            className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              ₹{totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {payments.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed Payments</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {payments.filter((p) => p.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setSearchTerm(e.target.value)}
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
                {(modeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
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
                {/* Payment Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value as 'all' | 'cash' | 'upi')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed' | 'failed')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
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
                Showing {filteredPayments.length} of {payments.length} transactions
                {(modeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                  <span className="text-slate-500 dark:text-slate-500"> (filtered)</span>
                )}
              </span>
            </div>

            {/* Active Filters Summary */}
            {(modeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
              <div className="flex flex-wrap gap-2">
                {modeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                    Mode: {modeFilter.charAt(0).toUpperCase() + modeFilter.slice(1)}
                    <button
                      onClick={() => setModeFilter('all')}
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium font-mono">
                      {payment.transaction_id}
                    </TableCell>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={paymentModeColors[payment.payment_mode]}>
                        {payment.payment_mode.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Header with Transaction ID and Amount */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                        {payment.transaction_id}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{payment.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">₹{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment Mode and Status */}
                  <div className="flex items-center gap-3">
                    <Badge className={paymentModeColors[payment.payment_mode]}>
                      {payment.payment_mode.toUpperCase()}
                    </Badge>
                    <Badge className={statusColors[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(payment.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredPayments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemName="payments"
        />
      )}
    </div>
  );
}
