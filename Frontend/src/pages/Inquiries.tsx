import { useState, useEffect, useCallback } from 'react';
import { useInquiryStore } from '@/store/inquiry-store';
import {
  Search, Eye, Mail, Phone, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, Trash2,
  Filter, MessageSquare, ChevronRight, ChevronLeft,
  RefreshCw, Users, BookOpen, Layers
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Inquiry } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  Pending: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
    label: 'Pending'
  },
  Approved: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    label: 'Approved'
  },
  Disapproved: {
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: XCircle,
    label: 'Disapproved'
  },
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block mb-1.5">
    {children}
  </span>
);

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
      toast.success('Inquiry management updated');
    } catch (error) {
      toast.error('Failed to update inquiry');
    }
  };

  const StatusIcon = statusConfig[inquiry.status].icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/20 text-slate-400 hover:text-gold-600 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <Eye className="w-4.5 h-4.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950 rounded-3xl">
        <div className="bg-gradient-to-r from-gold-500 to-amber-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Inquiry Details</DialogTitle>
              <p className="text-gold-100 text-xs opacity-80">Reference ID: {inquiry.id.slice(0, 8)}</p>
            </div>
          </div>
          <Badge className={`${statusConfig[inquiry.status].color} border shadow-inner px-3 py-1`}>
            <StatusIcon className="w-3 h-3 mr-1.5" />
            {inquiry.status}
          </Badge>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label>Customer Name</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-600 font-bold text-sm">
                    {inquiry.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{inquiry.name}</span>
                </div>
              </div>

              <div>
                <Label>Contact Details</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-gold-500" /> {inquiry.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-gold-500" /> {inquiry.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Submission Info</Label>
                <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white font-medium p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  {format(new Date(inquiry.created_at), 'PPP')}
                  <span className="mx-1 text-slate-300">|</span>
                  <Clock className="w-4 h-4 text-gold-500" />
                  {format(new Date(inquiry.created_at), 'pp')}
                </div>
              </div>

              <div>
                <Label>Subject Preference</Label>
                <Badge variant="outline" className="text-sm font-semibold border-gold-200 text-gold-700 bg-gold-50 dark:bg-gold-900/10 dark:text-gold-400">
                  {inquiry.subject}
                </Badge>
              </div>
            </div>
          </div>

          {(inquiry.event_type || inquiry.guest_count) && (
            <div className="p-6 bg-slate-950 dark:bg-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-20 h-20 text-gold-500" />
              </div>
              <h4 className="text-white dark:text-gold-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Event Specification
              </h4>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {inquiry.event_type && (
                  <div>
                    <Label>Event Category</Label>
                    <p className="text-white text-lg font-bold capitalize">{inquiry.event_type}</p>
                  </div>
                )}
                {inquiry.guest_count && (
                  <div>
                    <Label>Guest Capacity</Label>
                    <p className="text-white text-lg font-bold">{inquiry.guest_count} <span className="text-xs font-normal opacity-60 ml-1">Expected</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Label>Customer Inquiry Message</Label>
            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 relative">
              <MessageSquare className="absolute -top-3 -left-3 w-8 h-8 text-indigo-200 dark:text-indigo-900/50" />
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{inquiry.message}"
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gold-500" />
                Administrative Control
              </h4>
              <Button
                variant={editMode ? "ghost" : "outline"}
                size="sm"
                className="rounded-full text-xs font-bold h-8 px-4"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Cancel Changes" : "Edit Status & Notes"}
              </Button>
            </div>

            {editMode ? (
              <div className="space-y-4 p-5 bg-gold-50/30 dark:bg-gold-900/10 rounded-3xl border border-gold-100 dark:border-gold-900/30 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Allocation Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: 'Pending' | 'Approved' | 'Disapproved') => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-slate-900">
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
                  <Label>Management Remarks (Internal Only)</Label>
                  <Textarea
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Type internal staff notes here..."
                    className="min-h-[100px] rounded-2xl bg-white dark:bg-slate-900 resize-none"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white h-12 rounded-2xl font-bold shadow-lg shadow-gold-500/20 transition-all active:scale-[0.98]"
                >
                  Confirm Management Update
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {inquiry.internal_notes && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Label>Current Remarks</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {inquiry.internal_notes}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/10 font-bold transition-all"
                    onClick={() => updateInquiry(inquiry.id, { status: 'Approved' })}
                    disabled={inquiry.status === 'Approved'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Approved
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/10 font-bold transition-all"
                    onClick={() => updateInquiry(inquiry.id, { status: 'Disapproved' })}
                    disabled={inquiry.status === 'Disapproved'}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Mark Rejected
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Inquiries() {
  const {
    inquiries, isLoading, total, totalPages, fetchInquiries, deleteInquiry, updateInquiry
  } = useInquiryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Inquiry['status']>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
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
      limit: 10
    });
  }, [searchTerm, statusFilter, eventTypeFilter, subjectFilter, currentPage, fetchInquiries]);

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

  const handleRefresh = () => {
    performFetch();
    toast.info('Data refreshed');
  };

  const subjects = ["General Inquiry", "Bulk Order / Catering", "Feedback", "Other"];
  const eventTypes = ["wedding", "corporate", "birthday", "anniversary", "other"];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Inquiries</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-15 font-medium flex items-center gap-2">
            Centralized hub for all customer contact form submissions
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="px-6 py-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Submissions</span>
            <span className="text-2xl font-black text-gold-600">{total}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl hover:bg-gold-50 dark:hover:bg-gold-900/20 text-gold-600"
            onClick={handleRefresh}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] border border-white/20 dark:border-white/5">
        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-gold-500 transition-colors" />
              <Input
                placeholder="Search name or contact..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-12 h-14 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus-visible:ring-gold-500 transition-shadow hover:shadow-md"
              />
            </div>

            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10 pointer-events-none group-focus-within:text-gold-500" />
              <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-14 pl-12 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Disapproved">Disapproved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10 pointer-events-none group-focus-within:text-gold-500" />
              <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-14 pl-12 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10 pointer-events-none group-focus-within:text-gold-500" />
              <Select value={eventTypeFilter} onValueChange={(v) => { setEventTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-14 pl-12 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all">All Events</SelectItem>
                  {eventTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="h-14 rounded-2xl border-none bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-gold-500 hover:text-white transition-all shadow-sm hover:shadow-gold-500/30"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSubjectFilter('all');
                setEventTypeFilter('all');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Customer Profile</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact Node</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject & Payload</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Event Specs</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                      <p className="text-slate-400 font-medium italic">Synchronizing with database...</p>
                    </div>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                      <BookOpen className="w-16 h-16 text-slate-300" />
                      <p className="text-xl font-black text-slate-400 tracking-tight">Zero Inquiries Found</p>
                    </div>
                  </td>
                </tr>
              ) : inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gold-50/30 dark:hover:bg-gold-900/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-600 font-black text-lg group-hover:scale-110 transition-transform">
                        {inquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white capitalize group-hover:text-gold-600 transition-colors">{inquiry.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {format(new Date(inquiry.created_at), 'dd MMM yyyy, p')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-gold-500 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-gold-600 dark:text-gold-500 uppercase tracking-tighter bg-gold-50 dark:bg-gold-900/10 px-2 py-0.5 rounded inline-block">
                        {inquiry.subject}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px] italic">
                        "{inquiry.message}"
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {inquiry.event_type ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                          {inquiry.event_type}
                        </div>
                        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {inquiry.guest_count} Guest Payload
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] opacity-30">N/A</Badge>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`${statusConfig[inquiry.status].color} rounded-lg border px-3 py-1 font-bold text-[10px]`}>
                      {inquiry.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <InquiryDetailModal inquiry={inquiry} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all"
                        onClick={() => handleDelete(inquiry.id, inquiry.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Showing page <span className="text-gold-600 font-black">{currentPage}</span> of <span className="font-black">{totalPages}</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-10 px-6 rounded-2xl font-bold bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                className="h-10 px-6 rounded-2xl font-bold bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(v) => setDeleteConfirm(prev => ({ ...prev, isOpen: v }))}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-950 p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Delete Inquiry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-base">
              You are about to permanently remove the inquiry from <span className="font-bold text-slate-900 dark:text-white">{deleteConfirm.name}</span>.
              This action cannot be undone and will remove all associated management notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel className="h-12 rounded-2xl font-bold border-none bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400">
              Keep Inquiry
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-12 rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}
