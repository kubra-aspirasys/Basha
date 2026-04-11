import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Globe, Lock, Shield, Coffee, Zap } from 'lucide-react';
import PageHeader from "@/components/PageHeader";

const apiEndpoints = [
  // Auth & Profile
  { name: 'User Login', path: '/api/auth/login', method: 'POST', auth: 'None', desc: 'Authenticate user and receive JWT' },
  { name: 'Admin Login', path: '/api/auth/admin-login', method: 'POST', auth: 'None', desc: 'Secure login for administrative panel' },
  { name: 'My Profile', path: '/api/profile', method: 'GET', auth: 'JWT', desc: 'Retrieve details of the authenticated user' },
  
  // Menu & Catalog
  { name: 'List Categories', path: '/api/menu/categories', method: 'GET', auth: 'None', desc: 'Fetch all product categories' },
  { name: 'List items', path: '/api/menu/items', method: 'GET', auth: 'None', desc: 'Fetch all available menu products' },
  { name: 'Manage Items', path: '/api/menu/items', method: 'POST', auth: 'Admin', desc: 'Add new items to the catalog' },
  
  // Orders lifecycle
  { name: 'Place Order', path: '/api/customer/orders', method: 'POST', auth: 'JWT', desc: 'Submit a new customer order' },
  { name: 'Order History', path: '/api/customer/orders', method: 'GET', auth: 'JWT', desc: 'View previous orders for a customer' },
  { name: 'Admin Order Pool', path: '/api/admin/orders', method: 'GET', auth: 'Admin/Staff', desc: 'Global order management for staff' },
  { name: 'Update Status', path: '/api/admin/orders/:id/status', method: 'PATCH', auth: 'Admin/Staff', desc: 'Update order progress' },
  
  // CMS & Settings
  { name: 'Site Settings', path: '/api/cms/site-settings', method: 'GET', auth: 'None', desc: 'Public website configuration' },
  { name: 'Update Settings', path: '/api/cms/site-settings', method: 'POST', auth: 'Admin', desc: 'Modify site branding and defaults' },
  { name: 'Upload Media', path: '/api/cms/upload', method: 'POST', auth: 'Admin', desc: 'Upload images to the server' },
  
  // Dashboard & Analytics
  { name: 'Dashboard Stats', path: '/api/dashboard/stats', method: 'GET', auth: 'Admin/Staff', desc: 'Fetch business meta-data and trends' },
  
  // Customers & Addresses
  { name: 'Customer List', path: '/api/customers', method: 'GET', auth: 'Admin', desc: 'Manage registered user base' },
  { name: 'My Addresses', path: '/api/addresses', method: 'GET', auth: 'JWT', desc: 'Manage saved delivery locations' },
  
  // Offers & Notifications
  { name: 'Active Offers', path: '/api/offers', method: 'GET', auth: 'None', desc: 'Fetch promotional coupon codes' },
  { name: 'Manage Notifications', path: '/api/notifications', method: 'GET', auth: 'JWT', desc: 'System and order notifications' },
];

export default function APICollection() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredEndpoints = apiEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'POST': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      case 'PUT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'PATCH': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'DELETE': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getAuthBadge = (auth: string) => {
    if (auth === 'None') return <Badge variant="outline" className="text-slate-500 border-slate-200"><Globe className="w-3 h-3 mr-1" /> Public</Badge>;
    if (auth === 'JWT') return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50"><Lock className="w-3 h-3 mr-1" /> Customer</Badge>;
    return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50"><Shield className="w-3 h-3 mr-1" /> {auth}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="API Collection Reference" 
        description="Comprehensive list of all available system endpoints and their specifications"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-none premium-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl text-white">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Base URL</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">bashafood.in/api</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 border-none premium-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  All Systems Operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border-none premium-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-xl text-white">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Version</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">v1.2.0 (Stable)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden premium-shadow">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <Input 
              placeholder="Search by endpoint name or path..." 
              className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="w-[200px] font-bold uppercase tracking-wider text-xs">Endpoint Name</TableHead>
                <TableHead className="w-[100px] font-bold uppercase tracking-wider text-xs">Method</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-xs">Path</TableHead>
                <TableHead className="w-[150px] font-bold uppercase tracking-wider text-xs">Auth Level</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-xs">Description</TableHead>
                <TableHead className="text-right font-bold uppercase tracking-wider text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((endpoint, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {endpoint.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getMethodColor(endpoint.method)} border font-bold px-2.5 py-0.5 rounded-md shadow-sm`}>
                        {endpoint.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-pink-600 dark:text-pink-400">
                        {endpoint.path}
                      </code>
                    </TableCell>
                    <TableCell>
                      {getAuthBadge(endpoint.auth)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {endpoint.desc}
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-blue-500 hover:text-blue-700 font-medium text-xs underline-offset-4 hover:underline">
                        Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                    No endpoints match your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
