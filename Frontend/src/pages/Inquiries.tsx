
import { useState, useEffect, useCallback } from 'react';
import { useInquiryStore } from '@/store/inquiry-store';
import {
  Search, Eye, Mail, Phone, Clock,
  CheckCircle, XCircle, Trash2,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Pagination } from '@/components/ui/pagination';
import { Inquiry } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  Pending: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    icon: Clock,
    label: 'Pending'
  },
  Approved: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'Approved'
  },
  Disapproved: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: XCircle,
    label: 'Disapproved'
  },
};

function InquiryDetailModal({ inquiry }: { inquiry: Inquiry }) {
  const { updateInquiry } = useInquiryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: inquiry.status,
    internal_notes: inquiry.internal_notes || '',
  });

  const handleSave = async () => {
    try {
      await updateInquiry(inquiry.id, formData);
      setEditMode(false);
      toast.success('Inquiry updated successfully');
    } catch (error) {
      toast.error('Failed to update inquiry');
    }
  };

  const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Inquiry Details</span>
            </div>
            <Badge className={`${statusConfig[inquiry.status]?.color || statusConfig.Pending.color} border shadow - sm px - 3 py - 1`}>
              <StatusIcon className="w-3 h-3 mr-1.5" />
              {inquiry.status}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-slate-500">ID: {inquiry.id}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Name</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {inquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{inquiry.name}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Contact</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inquiry Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Inquiry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Subject</label>
                  <p className="font-medium mt-1">{inquiry.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Date</label>
                  <p className="text-sm mt-1">{format(new Date(inquiry.created_at), 'PPP pp')}</p>
                </div>
                {inquiry.event_type && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">Event Type</label>
                    <p className="font-medium mt-1 capitalize">{inquiry.event_type}</p>
                  </div>
                )}
                {inquiry.guest_count && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">Guests</label>
                    <p className="font-medium mt-1">{inquiry.guest_count}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Message</label>
                <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-sm italic text-slate-700 dark:text-slate-300">
                  "{inquiry.message}"
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Internal Management</CardTitle>
              <Button
                variant={editMode ? "ghost" : "outline"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Status</label>
                      <Select
                        value={formData.status}
                        onValueChange={(v: 'Pending' | 'Approved' | 'Disapproved') => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Disapproved">Disapproved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Internal Notes</label>
                    <Textarea
                      value={formData.internal_notes}
                      onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                      placeholder="Add internal notes..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">Internal Notes</label>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                      {inquiry.internal_notes || "No internal notes added."}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => updateInquiry(inquiry.id, { status: 'Approved' })}
                      disabled={inquiry.status === 'Approved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => updateInquiry(inquiry.id, { status: 'Disapproved' })}
                      disabled={inquiry.status === 'Disapproved'}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Inquiries() {
  const {
    inquiries, isLoading, total, totalPages, fetchInquiries, deleteInquiry
  } = useInquiryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Inquiry['status']>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string, name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const performFetch = useCallback(() => {
    fetchInquiries({
      search: searchTerm,
      status: statusFilter,
      eventType: eventTypeFilter,
      subject: subjectFilter,
      page: currentPage,
      limit: itemsPerPage
    });
  }, [searchTerm, statusFilter, eventTypeFilter, subjectFilter, currentPage, itemsPerPage, fetchInquiries]);

  useEffect(() => {
    performFetch();
  }, [performFetch]);

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteInquiry(deleteConfirm.id);
      toast.success('Inquiry deleted successfully');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const subjects = ["General Inquiry", "Bulk Order / Catering", "Feedback", "Other"];
  const eventTypes = ["wedding", "corporate", "birthday", "anniversary", "other"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inquiries</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage customer inquiries, feedback, and bulk order requests
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Inquiries</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inquiry Management</h3>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => performFetch()}
            >
              <RefreshCw className={`w - 4 h - 4 ${isLoading ? 'animate-spin' : ''} `} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Disapproved">Disapproved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={eventTypeFilter} onValueChange={(v) => { setEventTypeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {eventTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Subject & Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading inquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {inquiry.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white capitalize">{inquiry.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">{inquiry.email}</div>
                      <div className="text-sm text-slate-500">{inquiry.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{inquiry.subject}</div>
                      <div className="text-sm text-slate-500">{format(new Date(inquiry.created_at), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inquiry.event_type ? (
                        <div className="text-sm text-slate-900 dark:text-white capitalize">
                          {inquiry.event_type} ({inquiry.guest_count} guests)
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${statusConfig[inquiry.status]?.color || statusConfig.Pending.color} `}>
                        {inquiry.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <InquiryDetailModal inquiry={inquiry} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(inquiry.id, inquiry.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {inquiry.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{inquiry.name}</div>
                      <div className="text-sm text-slate-500">{format(new Date(inquiry.created_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[inquiry.status]?.color || statusConfig.Pending.color} `}>
                    {inquiry.status}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium mb-1">{inquiry.subject}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">"{inquiry.message}"</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex-1">
                    <InquiryDetailModal inquiry={inquiry} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(inquiry.id, inquiry.name)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="inquiries"
          />
        )}
      </div>

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(v) => setDeleteConfirm(prev => ({ ...prev, isOpen: v }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the inquiry from <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
