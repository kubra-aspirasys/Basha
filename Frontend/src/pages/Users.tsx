import { useState, useMemo, useRef } from 'react';
import { useCustomerStore } from '@/store/customer-store';
import { useOrderStore } from '@/store/order-store';
import { Search, Ban, Check, Eye, MessageSquare, Download, Star, TrendingUp, Clock, DollarSign, Plus, Users as UsersIcon, Send, Mail, Smartphone, Upload, FileText, Eye as PreviewIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, Order } from '@/types';

// const ITEMS_PER_PAGE = 10;

// Add New User Modal Component
function AddUserModal() {
  const { addCustomer } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    is_blocked: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      addCustomer({
        ...formData,
        is_active: true,
        last_activity: new Date().toISOString()
      });
      setFormData({ name: '', email: '', phone: '', address: '', is_blocked: false });
      setIsOpen(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gold-500" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter delivery address"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_blocked"
              checked={formData.is_blocked}
              onChange={(e) => handleInputChange('is_blocked', e.target.checked)}
              className="w-4 h-4 text-gold-600 bg-slate-100 border-slate-300 rounded focus:ring-gold-500 dark:focus:ring-gold-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="is_blocked" className="text-sm text-slate-700 dark:text-slate-300">
              Block this customer
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
            >
              Add Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Customer Detail Modal Component
function CustomerDetailModal({ customer, orders }: { customer: Customer; orders: Order[] }) {
  const customerOrders = orders.filter(order => order.customer_id === customer.id);
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
  const favoriteItems = customerOrders
    .flatMap(order => order.items)
    .reduce((acc, item) => {
      acc[item.menu_item_name] = (acc[item.menu_item_name] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
  const mostOrderedItem = Object.entries(favoriteItems).sort(([, a], [, b]) => b - a)[0];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white font-bold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          {customer.name}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Email:</strong> {customer.email}</div>
                <div><strong>Phone:</strong> {customer.phone || 'Not provided'}</div>
                <div><strong>Address:</strong> {customer.address || 'Not provided'}</div>
                <div><strong>Member Since:</strong> {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}</div>
                <div>
                  <strong>Status:</strong>
                  <Badge className={`ml-2 ${customer.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {customer.is_blocked ? 'Blocked' : 'Active'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span><strong>Total Orders:</strong> {customerOrders.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span><strong>Total Spent:</strong> ₹{totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span><strong>Avg Order Value:</strong> ₹{averageOrderValue.toFixed(0)}</span>
                </div>
                {mostOrderedItem && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span><strong>Favorite Item:</strong> {mostOrderedItem[0]} ({mostOrderedItem[1]} times)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-3">
            {customerOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-500">No orders found for this customer.</p>
                </CardContent>
              </Card>
            ) : (
              customerOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Order #{order.order_number}</h4>
                        <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{order.total_amount}</div>
                        <Badge className={`mt-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>Delivery Address:</strong> {order.delivery_address}</p>
                      <div className="text-sm">
                        <strong>Items:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {order.items.map((item, index) => (
                            <li key={index}>{item.menu_item_name} x{item.quantity} - ₹{item.price}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

// Send Message Modal Component
function SendMessageModal({ customers, orders }: { customers: Customer[]; orders: Order[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageType, setMessageType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // WhatsApp message state
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappImage, setWhatsappImage] = useState<File | null>(null);
  const [whatsappImagePreview, setWhatsappImagePreview] = useState<string | null>(null);

  // Email message state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailAttachment, setEmailAttachment] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers(new Set());
      setSelectAll(false);
    } else {
      const allCustomerIds = new Set(customers.map(c => c.id));
      setSelectedCustomers(allCustomerIds);
      setSelectAll(true);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
    setSelectAll(newSelected.size === customers.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWhatsappImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setWhatsappImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmailAttachment(file);
    }
  };

  const removeImage = () => {
    setWhatsappImage(null);
    setWhatsappImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setEmailAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleSendMessage = () => {
    const selectedCustomersData = customers.filter(c => selectedCustomers.has(c.id));

    if (messageType === 'whatsapp') {
      // Handle WhatsApp sending logic
      console.log('Sending WhatsApp message:', {
        customers: selectedCustomersData,
        message: whatsappMessage,
        image: whatsappImage
      });

      // Generate WhatsApp URLs for each customer
      selectedCustomersData.forEach(customer => {
        if (customer.phone) {
          const message = encodeURIComponent(whatsappMessage);
          const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }
      });
    } else {
      // Handle Email sending logic
      console.log('Sending Email:', {
        customers: selectedCustomersData,
        subject: emailSubject,
        message: emailMessage,
        attachment: emailAttachment
      });

      // Generate mailto URLs for each customer
      selectedCustomersData.forEach(customer => {
        const subject = encodeURIComponent(emailSubject);
        const body = encodeURIComponent(emailMessage);
        const mailtoUrl = `mailto:${customer.email}?subject=${subject}&body=${body}`;
        window.open(mailtoUrl);
      });
    }

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomers(new Set());
    setSelectAll(false);
    setWhatsappMessage('');
    setWhatsappImage(null);
    setWhatsappImagePreview(null);
    setEmailSubject('');
    setEmailMessage('');
    setEmailAttachment(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const selectedCustomersData = customers.filter(c => selectedCustomers.has(c.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Send Promotional Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Type Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant={messageType === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setMessageType('whatsapp')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'outline'}
              onClick={() => setMessageType('email')}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>

          {/* Customer Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Recipients</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({customers.length} customers)
                </label>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                {customers.map((customer) => {
                  const customerOrders = orders.filter(order => order.customer_id === customer.id);
                  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);

                  return (
                    <div key={customer.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Checkbox
                        id={customer.id}
                        checked={selectedCustomers.has(customer.id)}
                        onCheckedChange={() => handleCustomerSelect(customer.id)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">{customer.name}</div>
                          <div className="text-sm text-slate-500 truncate">
                            {messageType === 'whatsapp' ? customer.phone || 'No phone' : customer.email}
                          </div>
                          <div className="text-xs text-slate-400">
                            {customerOrders.length} orders • ₹{totalSpent.toLocaleString()} spent
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedCustomers.size > 0 && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedCustomers.size} customer{selectedCustomers.size !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Message Composition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compose Message</h3>

            {messageType === 'whatsapp' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    WhatsApp Message
                  </label>
                  <Textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Type your promotional message here..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Image (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>

                    {whatsappImagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={whatsappImagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Subject
                  </label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Message
                  </label>
                  <Textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Type your promotional email content here..."
                    rows={6}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Attachment (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      onChange={handleAttachmentUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Upload Attachment
                    </Button>

                    {emailAttachment && (
                      <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                          {emailAttachment.name}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={removeAttachment}
                          className="w-6 h-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedCustomers.size > 0 && (whatsappMessage || emailMessage) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PreviewIcon className="w-5 h-5" />
                Preview
              </h3>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-500 mb-2">
                  Sending to: {selectedCustomersData.map(c => c.name).join(', ')}
                </div>

                {messageType === 'whatsapp' ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">WhatsApp Message:</div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      {whatsappImagePreview && (
                        <img
                          src={whatsappImagePreview}
                          alt="Preview"
                          className="w-full max-w-xs rounded mb-2"
                        />
                      )}
                      <div className="whitespace-pre-wrap">{whatsappMessage}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Email:</div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-sm font-semibold mb-1">Subject: {emailSubject}</div>
                      <div className="whitespace-pre-wrap">{emailMessage}</div>
                      {emailAttachment && (
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          📎 {emailAttachment.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleSendMessage}
              disabled={selectedCustomers.size === 0 || (messageType === 'whatsapp' ? !whatsappMessage : !emailMessage || !emailSubject)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="w-4 h-4" />
              Send {messageType === 'whatsapp' ? 'WhatsApp' : 'Email'} ({selectedCustomers.size})
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { customers, updateCustomerStatus } = useCustomerStore();
  const { orders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'orders' | 'spending'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !customer.is_blocked) ||
        (statusFilter === 'blocked' && customer.is_blocked);

      return matchesSearch && matchesStatus;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at ?? 0).getTime();
          bValue = new Date(b.created_at ?? 0).getTime();
          break;
        case 'orders':
          aValue = orders.filter(order => order.customer_id === a.id).length;
          bValue = orders.filter(order => order.customer_id === b.id).length;
          break;
        case 'spending':
          aValue = orders.filter(order => order.customer_id === a.id).reduce((sum, order) => sum + order.total_amount, 0);
          bValue = orders.filter(order => order.customer_id === b.id).reduce((sum, order) => sum + order.total_amount, 0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder, orders]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleToggleBlock = (id: string, currentStatus: boolean) => {
    updateCustomerStatus(id, !currentStatus);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage customer accounts, view order history, and analyze customer behavior
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {customers.filter(c => !c.is_blocked).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Blocked Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {customers.filter(c => c.is_blocked).length}
                </p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Management</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <AddUserModal />
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <SendMessageModal customers={customers} orders={orders} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'blocked') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="blocked">Blocked Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'name' | 'email' | 'created_at' | 'orders' | 'spending') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="created_at">Join Date</SelectItem>
                <SelectItem value="orders">Order Count</SelectItem>
                <SelectItem value="spending">Total Spending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
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
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCustomers.map((customer) => {
                const customerOrders = orders.filter(order => order.customer_id === customer.id);
                const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);

                return (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                          <div className="text-sm text-slate-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-900 dark:text-white">{customer.email}</div>
                      <div className="text-sm text-slate-500">{customer.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{customerOrders.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium">₹{totalSpent.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.is_blocked ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCustomer(customer)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          {selectedCustomer && (
                            <CustomerDetailModal customer={selectedCustomer} orders={orders} />
                          )}
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleBlock(customer.id, customer.is_blocked ?? false)}
                          className={`flex items-center gap-1 ${customer.is_blocked
                            ? 'text-green-700 hover:text-green-800'
                            : 'text-red-700 hover:text-red-800'
                            }`}
                        >
                          {customer.is_blocked ? (
                            <>
                              <Check className="w-4 h-4" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4" />
                              Block
                            </>
                          )}
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
          {paginatedCustomers.map((customer) => {
            const customerOrders = orders.filter(order => order.customer_id === customer.id);
            const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);

            return (
              <Card key={customer.id} className="p-4">
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 rounded-full flex items-center justify-center text-white font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                      <div className="text-sm text-slate-500">ID: {customer.id}</div>
                      <div className="text-sm text-slate-500">{customer.email}</div>
                      <div className="text-sm text-slate-500">{customer.phone || 'No phone'}</div>
                    </div>
                    <div className="text-right">
                      {customer.is_blocked ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Orders</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{customerOrders.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Spent</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">₹{totalSpent.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Joined: {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      {selectedCustomer && (
                        <CustomerDetailModal customer={selectedCustomer} orders={orders} />
                      )}
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleBlock(customer.id, customer.is_blocked ?? false)}
                      className={`flex-1 flex items-center gap-1 ${customer.is_blocked
                        ? 'text-green-700 hover:text-green-800'
                        : 'text-red-700 hover:text-red-800'
                        }`}
                    >
                      {customer.is_blocked ? (
                        <>
                          <Check className="w-4 h-4" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          Block
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="customers"
          />
        )}
      </div>
    </div>
  );
}
