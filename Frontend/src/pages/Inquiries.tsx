import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInquiryStore } from '@/store/inquiry-store';
import { inquiryService } from '@/lib/inquiry-service';
import { Search, Eye, MessageSquare, Phone, Mail, Calendar, Users, DollarSign, Star, Clock, CheckCircle, XCircle, AlertCircle, Download, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Inquiry } from '@/types';

// const ITEMS_PER_PAGE = 10;

const statusConfig = {
  new: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: Clock,
    label: 'New'
  },
  contacted: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    icon: MessageSquare,
    label: 'Contacted'
  },
  quoted: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: DollarSign,
    label: 'Quoted'
  },
  converted: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'Converted'
  },
  closed: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: XCircle,
    label: 'Closed'
  },
};

const priorityConfig = {
  low: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    label: 'Low'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    label: 'Medium'
  },
  high: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    label: 'High'
  },
};

// Add Inquiry Modal Component
function AddInquiryModal() {
  const { addInquiry } = useInquiryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    event_type: '',
    event_date: '',
    guest_count: '',
    additional_details: '',
    status: 'new' as Inquiry['status'],
    priority: 'medium' as Inquiry['priority'],
    assigned_to: '',
    notes: '',
    quote_amount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inquiryData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      event_type: formData.event_type as 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'other' | undefined,
      event_date: formData.event_date || undefined,
      guest_count: formData.guest_count ? parseInt(formData.guest_count) : undefined,
      additional_details: formData.additional_details || undefined,
      status: formData.status,
      priority: formData.priority,
      assigned_to: formData.assigned_to || undefined,
      notes: formData.notes || undefined,
      quote_amount: formData.quote_amount || undefined,
    };

    addInquiry(inquiryData);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      event_type: '',
      event_date: '',
      guest_count: '',
      additional_details: '',
      status: 'new',
      priority: 'medium',
      assigned_to: '',
      notes: '',
      quote_amount: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Inquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Add New Inquiry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Type
              </label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="private">Private Party</SelectItem>
                  <SelectItem value="birthday">Birthday Party</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Date
              </label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Guest Count
              </label>
              <Input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                placeholder="Enter guest count"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value: Inquiry['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <Select value={formData.priority} onValueChange={(value: Inquiry['priority']) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigned To
            </label>
            <Input
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quote Amount (₹)
            </label>
            <Input
              type="number"
              value={formData.quote_amount}
              onChange={(e) => setFormData({ ...formData, quote_amount: parseInt(e.target.value) || 0 })}
              placeholder="Enter quote amount"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Additional Details
            </label>
            <Textarea
              value={formData.additional_details}
              onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
              placeholder="Enter any additional details about the event..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any internal notes..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Inquiry
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

// Inquiry Detail Modal Component
function InquiryDetailModal({ inquiry }: { inquiry: Inquiry }) {
  const { updateInquiryStatus, updateInquiryPriority, updateInquiryNotes, updateInquiryQuote, assignInquiry } = useInquiryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: inquiry.status,
    priority: inquiry.priority,
    notes: inquiry.notes || '',
    quote_amount: inquiry.quote_amount || 0,
    assigned_to: inquiry.assigned_to || '',
  });

  const handleSave = () => {
    updateInquiryStatus(inquiry.id, formData.status);
    updateInquiryPriority(inquiry.id, formData.priority);
    updateInquiryNotes(inquiry.id, formData.notes);
    if (formData.quote_amount > 0) {
      updateInquiryQuote(inquiry.id, formData.quote_amount);
    }
    if (formData.assigned_to) {
      assignInquiry(inquiry.id, formData.assigned_to);
    }
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const statusConfigItem = statusConfig[inquiry.status];
  const priorityConfigItem = priorityConfig[inquiry.priority];
  const StatusIcon = statusConfigItem.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white font-bold">
              {inquiry.full_name.charAt(0).toUpperCase()}
            </div>
            Inquiry Details - {inquiry.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{inquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{inquiry.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      {(inquiry.created_at || inquiry.createdAt) ? new Date(inquiry.created_at || inquiry.createdAt!).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <Badge className={statusConfigItem.color}>
                      {statusConfigItem.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <Badge className={priorityConfigItem.color}>
                      {priorityConfigItem.label} Priority
                    </Badge>
                  </div>
                  {inquiry.assigned_to && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Assigned to: {inquiry.assigned_to}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {inquiry.additional_details && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300">{inquiry.additional_details}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Event Date</label>
                    <p className="font-medium">{inquiry.event_date || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Event Type</label>
                    <p className="font-medium capitalize">{inquiry.event_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guest Count</label>
                    <p className="font-medium">{inquiry.guest_count || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quote Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Quote Amount</label>
                    <p className="font-medium text-lg">
                      {inquiry.quote_amount ? `₹${inquiry.quote_amount.toLocaleString()}` : 'Not quoted yet'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                    <p className="font-medium">
                      {inquiry.updated_at ? new Date(inquiry.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Inquiry Management
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Status
                        </label>
                        <Select value={formData.status} onValueChange={(value: Inquiry['status']) => handleInputChange('status', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Priority
                        </label>
                        <Select value={formData.priority} onValueChange={(value: Inquiry['priority']) => handleInputChange('priority', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assigned To
                      </label>
                      <Input
                        value={formData.assigned_to}
                        onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                        placeholder="Enter assignee name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Quote Amount (₹)
                      </label>
                      <Input
                        type="number"
                        value={formData.quote_amount}
                        onChange={(e) => handleInputChange('quote_amount', parseInt(e.target.value) || 0)}
                        placeholder="Enter quote amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Notes
                      </label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add notes about this inquiry..."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleSave} className="flex-1">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Current Status
                      </label>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <Badge className={statusConfigItem.color}>
                          {statusConfigItem.label}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Priority
                      </label>
                      <Badge className={priorityConfigItem.color}>
                        {priorityConfigItem.label}
                      </Badge>
                    </div>

                    {inquiry.assigned_to && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Assigned To
                        </label>
                        <p className="font-medium">{inquiry.assigned_to}</p>
                      </div>
                    )}

                    {inquiry.quote_amount && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Quote Amount
                        </label>
                        <p className="font-medium text-lg">₹{inquiry.quote_amount.toLocaleString()}</p>
                      </div>
                    )}

                    {inquiry.notes && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Notes
                        </label>
                        <p className="text-slate-700 dark:text-slate-300">{inquiry.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Inquiries() {
  const {
    inquiries,
    stats,
    isLoading,
    fetchInquiries,
    fetchStats,
    updateInquiryStatus,
    updateInquiryPriority,
    deleteInquiry
  } = useInquiryStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'created_at' | 'full_name' | 'status' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | Inquiry['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Inquiry['priority']>('all');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Fetch inquiries and stats on mount and filter changes
  useEffect(() => {
    fetchInquiries({
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      sort: sortBy === 'created_at' ? (sortOrder === 'asc' ? 'created_at_asc' : 'created_at_desc') : sortBy,
      page: currentPage,
      limit: itemsPerPage
    });
    fetchStats();
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder, currentPage, itemsPerPage, fetchInquiries, fetchStats]);

  // Handle URL parameter to open specific inquiry
  useEffect(() => {
    const openInquiryId = searchParams.get('openInquiry');
    if (openInquiryId && inquiries.length > 0) {
      const inquiry = inquiries.find(i => i.id === openInquiryId);
      if (inquiry) {
        setSelectedInquiry(inquiry);
        // Remove the parameter from URL after opening
        setSearchParams({});
      }
    }
  }, [searchParams, inquiries, setSearchParams]);

  // Backend handles filtering and sorting, so we just use the store data
  const filteredInquiries = inquiries;

  const { totalPages } = useInquiryStore();
  const paginatedInquiries = filteredInquiries;

  const handleStatusChange = (id: string, status: Inquiry['status']) => {
    updateInquiryStatus(id, status);
  };

  // ... (inline edit handlers remain same)

  const handleInlineStatusEdit = (inquiryId: string) => {
    setEditingStatus(inquiryId);
    setEditingPriority(null);
  };

  const handleInlinePriorityEdit = (inquiryId: string) => {
    setEditingPriority(inquiryId);
    setEditingStatus(null);
  };

  const handleInlineStatusSave = (inquiryId: string, newStatus: Inquiry['status']) => {
    updateInquiryStatus(inquiryId, newStatus);
    setEditingStatus(null);
  };

  const handleInlinePrioritySave = (inquiryId: string, newPriority: Inquiry['priority']) => {
    updateInquiryPriority(inquiryId, newPriority);
    setEditingPriority(null);
  };

  const handleInlineCancel = () => {
    setEditingStatus(null);
    setEditingPriority(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete inquiry from ${name}?`)) {
      deleteInquiry(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const blob = await inquiryService.export({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        sort: sortBy === 'created_at' ? (sortOrder === 'asc' ? 'created_at_asc' : 'created_at_desc') : sortBy
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inquiries.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export inquiries:', error);
    }
  };

  // NOTE: stats are now fetched from the store, so no useMemo needed for them locally

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inquiries & Quotes</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage customer inquiries and track quote conversions
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Inquiries</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">New</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Quoted</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.quotedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Converted</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.convertedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Quote Value</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">₹{stats.totalQuoteValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inquiry Management</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <AddInquiryModal />
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: 'all' | Inquiry['status']) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: 'all' | Inquiry['priority']) => setPriorityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'created_at' | 'full_name' | 'status' | 'priority') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="full_name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                  <span className="text-xs text-blue-500 ml-1">(Click to edit)</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Priority
                  <span className="text-xs text-blue-500 ml-1">(Click to edit)</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedInquiries.map((inquiry) => {
                const statusConfigItem = statusConfig[inquiry.status];
                const priorityConfigItem = priorityConfig[inquiry.priority];
                const StatusIcon = statusConfigItem.icon;

                return (
                  <tr key={inquiry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {inquiry.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{inquiry.full_name}</div>
                          <div className="text-sm text-slate-500">{inquiry.email}</div>
                          <div className="text-sm text-slate-500">{inquiry.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-white capitalize">
                          {inquiry.event_type || 'Not specified'}
                        </div>
                        <div className="text-slate-500">
                          {inquiry.guest_count ? `${inquiry.guest_count} guests` : 'Guest count not specified'}
                        </div>
                        <div className="text-slate-500">
                          {inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString() : 'Date not specified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStatus === inquiry.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={inquiry.status}
                            onValueChange={(value: Inquiry['status']) => handleInlineStatusSave(inquiry.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleInlineCancel}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded transition-colors"
                          onClick={() => handleInlineStatusEdit(inquiry.id)}
                          title="Click to edit status"
                        >
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={statusConfigItem.color}>
                            {statusConfigItem.label}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingPriority === inquiry.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={inquiry.priority}
                            onValueChange={(value: Inquiry['priority']) => handleInlinePrioritySave(inquiry.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleInlineCancel}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded transition-colors"
                          onClick={() => handleInlinePriorityEdit(inquiry.id)}
                          title="Click to edit priority"
                        >
                          <Badge className={priorityConfigItem.color}>
                            {priorityConfigItem.label}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {inquiry.quote_amount ? `₹${inquiry.quote_amount.toLocaleString()}` : 'Not quoted'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {(inquiry.created_at || inquiry.createdAt) ? new Date(inquiry.created_at || inquiry.createdAt!).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <InquiryDetailModal inquiry={inquiry} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (inquiry.status === 'new') {
                              handleStatusChange(inquiry.id, 'contacted');
                            } else if (inquiry.status === 'contacted') {
                              handleStatusChange(inquiry.id, 'quoted');
                            } else if (inquiry.status === 'quoted') {
                              handleStatusChange(inquiry.id, 'converted');
                            }
                          }}
                          disabled={inquiry.status === 'converted' || inquiry.status === 'closed'}
                          className="text-green-600 hover:text-green-800"
                          title="Quick status update"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(inquiry.id, inquiry.full_name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {paginatedInquiries.map((inquiry) => {
            const statusConfigItem = statusConfig[inquiry.status];
            const priorityConfigItem = priorityConfig[inquiry.priority];
            const StatusIcon = statusConfigItem.icon;

            return (
              <Card key={inquiry.id} className="p-4">
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white font-bold">
                      {inquiry.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">{inquiry.full_name}</div>
                      <div className="text-sm text-slate-500">{inquiry.email}</div>
                      <div className="text-sm text-slate-500">{inquiry.phone}</div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Event:</span>
                      <span className="ml-2 capitalize">{inquiry.event_type || 'Not specified'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Guests:</span>
                      <span className="ml-2">{inquiry.guest_count ? `${inquiry.guest_count} guests` : 'Not specified'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Date:</span>
                      <span className="ml-2">{inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</div>
                      {editingStatus === inquiry.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={inquiry.status}
                            onValueChange={(value: Inquiry['status']) => handleInlineStatusSave(inquiry.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleInlineCancel}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                          onClick={() => handleInlineStatusEdit(inquiry.id)}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={statusConfigItem.color}>
                            {statusConfigItem.label}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Priority</div>
                      {editingPriority === inquiry.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={inquiry.priority}
                            onValueChange={(value: Inquiry['priority']) => handleInlinePrioritySave(inquiry.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleInlineCancel}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                          onClick={() => handleInlinePriorityEdit(inquiry.id)}
                        >
                          <Badge className={priorityConfigItem.color}>
                            {priorityConfigItem.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quote and Date */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Quote</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {inquiry.quote_amount ? `₹${inquiry.quote_amount.toLocaleString()}` : 'Not quoted'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Date</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <InquiryDetailModal inquiry={inquiry} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (inquiry.status === 'new') {
                          handleStatusChange(inquiry.id, 'contacted');
                        } else if (inquiry.status === 'contacted') {
                          handleStatusChange(inquiry.id, 'quoted');
                        } else if (inquiry.status === 'quoted') {
                          handleStatusChange(inquiry.id, 'converted');
                        }
                      }}
                      disabled={inquiry.status === 'converted' || inquiry.status === 'closed'}
                      className="flex-1 text-green-600 hover:text-green-800"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Quick Update</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(inquiry.id, inquiry.full_name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredInquiries.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInquiries.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="inquiries"
          />
        )}
      </div>

      {/* Selected Inquiry Modal */}
      {selectedInquiry && (
        <InquiryDetailModal inquiry={selectedInquiry} />
      )}
    </div>
  );
}
