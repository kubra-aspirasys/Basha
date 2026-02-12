import { useState, useEffect } from 'react';
import { usePaymentStore } from '@/store/payment-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Download, X, Plus, RefreshCw, Loader2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';

const paymentModeColors: Record<string, string> = {
  cash: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  upi: 'bg-gold-500/10 text-gold-600 dark:bg-gold-500/20 dark:text-gold-400',
  card: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  netbanking: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  completed: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  failed: 'bg-error/10 text-error dark:bg-error/20 dark:text-error',
  refunded: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
};

// Add Payment Modal Component
function AddPaymentModal({ onSuccess }: { onSuccess: () => void }) {
  const { addPayment, generateTransactionId, loading } = usePaymentStore();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    transaction_id: '',
    customer_name: '',
    amount: '',
    payment_mode: 'cash' as Payment['payment_mode'],
    status: 'completed' as Payment['status'],
    notes: '',
    payment_reference: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      transaction_id: formData.transaction_id,
      order_id: '',
      customer_id: '',
      customer_name: formData.customer_name,
      amount: parseFloat(formData.amount),
      payment_mode: formData.payment_mode,
      status: formData.status,
      notes: formData.notes || undefined,
      payment_reference: formData.payment_reference || undefined,
    };

    const result = await addPayment(paymentData);

    if (result) {
      toast({
        title: 'Payment Added',
        description: `Payment ${result.transaction_id} created successfully`,
      });
      setIsOpen(false);
      resetForm();
      onSuccess();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create payment',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_id: '',
      customer_name: '',
      amount: '',
      payment_mode: 'cash',
      status: 'completed',
      notes: '',
      payment_reference: '',
    });
  };

  const handleGenerateTransactionId = async () => {
    const txnId = await generateTransactionId();
    if (txnId) {
      setFormData({ ...formData, transaction_id: txnId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
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
                onClick={handleGenerateTransactionId}
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
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
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
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Reference
            </label>
            <Input
              value={formData.payment_reference}
              onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
              placeholder="e.g., UPI reference number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-h-[80px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Payment'
              )}
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

// Payment Details Modal
function PaymentDetailsModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</p>
              <p className="font-mono font-medium">{payment.transaction_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Amount</p>
              <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customer</p>
              <p className="font-medium">{payment.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Payment Mode</p>
              <Badge className={paymentModeColors[payment.payment_mode]}>
                {payment.payment_mode.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <Badge className={statusColors[payment.status]}>
                {payment.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
              <p className="text-sm">{new Date(payment.created_at || payment.createdAt || Date.now()).toLocaleString()}</p>
            </div>
          </div>

          {payment.payment_reference && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Payment Reference</p>
              <p className="font-mono">{payment.payment_reference}</p>
            </div>
          )}

          {payment.notes && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Notes</p>
              <p className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded">{payment.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Payments() {
  const {
    payments,
    loading,
    error,
    pagination,
    stats,
    fetchPayments,
    fetchPaymentStats,
    updatePaymentStatus,
    deletePayment,
    clearError
  } = usePaymentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filter states
  const [modeFilter, setModeFilter] = useState<'all' | 'cash' | 'upi' | 'card' | 'netbanking'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load payments on mount and when filters change
  useEffect(() => {
    loadPayments();
    fetchPaymentStats();
  }, []);

  const loadPayments = async () => {
    const filters: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (modeFilter !== 'all') filters.payment_mode = modeFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (searchTerm) filters.customer_name = searchTerm;

    // Date filtering
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case 'today':
          filters.startDate = today.toISOString();
          filters.endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          filters.startDate = weekStart.toISOString();
          filters.endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          filters.startDate = monthStart.toISOString();
          filters.endDate = monthEnd.toISOString();
          break;
        case 'custom':
          if (customDateFrom) filters.startDate = new Date(customDateFrom).toISOString();
          if (customDateTo) filters.endDate = new Date(customDateTo).toISOString();
          break;
      }
    }


    await fetchPayments(filters);
    await fetchPaymentStats({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
  };

  // Reload on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, modeFilter, statusFilter, dateFilter, customDateFrom, customDateTo, currentPage, itemsPerPage]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      clearError();
    }
  }, [error]);

  const totalPages = pagination?.totalPages || Math.ceil(payments.length / itemsPerPage);

  const totalAmount = stats?.totalRevenue || payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Amount', 'Payment Mode', 'Status', 'Reference', 'Date'];
    const rows = payments.map((payment) => [
      payment.transaction_id,
      payment.customer_name,
      payment.amount,
      payment.payment_mode,
      payment.status,
      payment.payment_reference || '',
      new Date(payment.created_at || payment.createdAt || Date.now()).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(cell => `"${cell}"`).join(',')),
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
    setCurrentPage(1);
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

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      const success = await deletePayment(paymentId);
      if (success) {
        toast({
          title: 'Payment Deleted',
          description: 'Payment has been deleted successfully',
        });
        // Refresh both list and stats
        loadPayments();
      }
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: Payment['status']) => {
    const result = await updatePaymentStatus(paymentId, newStatus);
    if (result) {
      toast({
        title: 'Status Updated',
        description: `Payment status changed to ${newStatus}`,
      });
      // Refresh both list and stats
      loadPayments();
    }
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
          <AddPaymentModal onSuccess={loadPayments} />
          <Button
            variant="outline"
            onClick={loadPayments}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              {pagination?.total || payments.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl sm:text-3xl font-bold text-success mt-2">
              {stats?.completedCount || payments.filter((p) => p.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-warning mt-2">
              {stats?.pendingCount || payments.filter((p) => p.status === 'pending').length}
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
                  placeholder="Search by customer name..."
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
                    onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
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
                Showing {payments.length} of {pagination?.total || payments.length} transactions
                {loading && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
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
          {/* Loading State */}
          {loading && payments.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading payments...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && payments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No payments found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {searchTerm || modeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first payment to get started'}
              </p>
            </div>
          )}

          {/* Desktop Table View */}
          {payments.length > 0 && (
            <>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
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
                          <select
                            value={payment.status}
                            onChange={(e) => handleStatusChange(payment.id, e.target.value as Payment['status'])}
                            className={`px-2 py-1 rounded text-xs font-medium border-0 ${statusColors[payment.status]} cursor-pointer`}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at || payment.createdAt || Date.now()).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                {payments.map((payment) => (
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

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(payment.created_at || payment.createdAt || Date.now()).toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={pagination?.total || payments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemName="payments"
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
