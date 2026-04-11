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
import { Search, Globe, Lock, Terminal, BookOpen, Coffee, Code2, Copy, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const customerEndpoints = [
  // Authentication
  { section: 'Authentication', name: 'Customer SignUp', path: '/api/auth/register', method: 'POST', auth: 'None', desc: 'Create a new customer account' },
  { name: 'Customer Login', path: '/api/auth/login', method: 'POST', auth: 'None', desc: 'Login to receive an access token' },
  { name: 'Verify Token', path: '/api/auth/verify', method: 'GET', auth: 'JWT', desc: 'Check if the current token is still valid' },

  // Profile & Addresses
  { section: 'Profile Management', name: 'Get Profile', path: '/api/profile', method: 'GET', auth: 'JWT', desc: 'Retrieve your profile information' },
  { name: 'Update Profile', path: '/api/profile', method: 'PUT', auth: 'JWT', desc: 'Update name, phone, or avatar' },
  { name: 'List Addresses', path: '/api/addresses', method: 'GET', auth: 'JWT', desc: 'Fetch all saved delivery locations' },
  { name: 'Add Address', path: '/api/addresses', method: 'POST', auth: 'JWT', desc: 'Save a new delivery address' },

  // Menu & Discovery
  { section: 'Menu & Discovery', name: 'List Categories', path: '/api/menu/categories', method: 'GET', auth: 'None', desc: 'Explore food categories and collections' },
  { name: 'Filter Menu Items', path: '/api/menu/items', method: 'GET', auth: 'None', desc: 'Search and filter dishes by type or price' },
  { name: 'Latest Offers', path: '/api/offers', method: 'GET', auth: 'None', desc: 'Fetch active promotional deals' },

  // Orders & Cart
  { section: 'Orders & Cart', name: 'Sync Cart', path: '/api/cart', method: 'POST', auth: 'JWT', desc: 'Sync local items with server-side cart' },
  { name: 'Place Order', path: '/api/customer/orders', method: 'POST', auth: 'JWT', desc: 'Convert cart items into a firm order' },
  { name: 'My Orders', path: '/api/customer/orders', method: 'GET', auth: 'JWT', desc: 'Track current and past order history' },
  { name: 'Cancel Order', path: '/api/customer/orders/:id/cancel', method: 'PUT', auth: 'JWT', desc: 'Request cancellation of a pending order' },

  // Support
  { section: 'Support', name: 'Submit Inquiry', path: '/api/contact', method: 'POST', auth: 'None', desc: 'Send a message to our support team' },
];

export default function CustomerAPIDocumentation() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  const filteredEndpoints = customerEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(`https://bashafood.in${path}`);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="relative mb-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F2A900]/10 blur-[100px] -z-10 rounded-full" />
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic">
            Developer <span className="text-[#F2A900]">Portal</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the Basha Food API Documentation. Integrate our authentic Hyderabadi flavors into your own applications with our robust REST endpoints.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1a1a] border border-[#F2A900]/10 p-6 rounded-2xl group hover:border-[#F2A900]/30 transition-all duration-500">
            <div className="w-12 h-12 bg-[#F2A900]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-[#F2A900]" />
            </div>
            <h3 className="text-white font-bold mb-1">Base Endpoint</h3>
            <p className="text-[#F2A900] font-mono text-sm">https://bashafood.in/api</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#F2A900]/10 p-6 rounded-2xl group hover:border-[#F2A900]/30 transition-all duration-500">
            <div className="w-12 h-12 bg-[#F2A900]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-[#F2A900]" />
            </div>
            <h3 className="text-white font-bold mb-1">Authentication</h3>
            <p className="text-gray-400 text-sm">Bearer Token in Authorization header</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#F2A900]/10 p-6 rounded-2xl group hover:border-[#F2A900]/30 transition-all duration-500">
            <div className="w-12 h-12 bg-[#F2A900]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-[#F2A900]" />
            </div>
            <h3 className="text-white font-bold mb-1">Response Format</h3>
            <p className="text-gray-400 text-sm">JSON (UTF-8) with success flags</p>
          </div>
        </div>

        {/* Documentation Table Section */}
        <div className="bg-[#111111] border border-[#F2A900]/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 bg-[#1a1a1a]/50 border-b border-[#F2A900]/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Endpoint Reference</h2>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search APIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border-[#F2A900]/20 pl-12 h-12 rounded-xl text-white focus:ring-[#F2A900]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#1a1a1a]">
                <TableRow className="border-[#F2A900]/10 hover:bg-transparent">
                  <TableHead className="py-6 px-8 text-gray-500 uppercase text-[11px] font-black tracking-widest">API Endpoint</TableHead>
                  <TableHead className="py-6 px-6 text-gray-500 uppercase text-[11px] font-black tracking-widest">Method</TableHead>
                  <TableHead className="py-6 px-6 text-gray-500 uppercase text-[11px] font-black tracking-widest">Security</TableHead>
                  <TableHead className="py-6 px-6 text-gray-500 uppercase text-[11px] font-black tracking-widest">Description</TableHead>
                  <TableHead className="py-6 px-8 text-right text-gray-500 uppercase text-[11px] font-black tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.length > 0 ? (
                  filteredEndpoints.map((endpoint, index) => (
                    <React.Fragment key={index}>
                      {endpoint.section && (
                        <TableRow className="bg-[#F2A900]/5 hover:bg-[#F2A900]/5 border-none">
                          <TableCell colSpan={5} className="py-3 px-8">
                            <span className="text-[10px] font-black uppercase text-[#F2A900] tracking-[0.2em]">{endpoint.section}</span>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="border-[#F2A900]/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-white font-bold text-lg group-hover:text-[#F2A900] transition-colors line-clamp-1">{endpoint.name}</span>
                            <code className="text-[#F2A900]/60 text-xs font-mono bg-[#0a0a0a] px-2 py-0.5 rounded w-fit">
                              {endpoint.path}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <Badge variant="outline" className={`${getMethodColor(endpoint.method)} font-black text-[10px] px-3 py-1 border`}>
                            {endpoint.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex items-center gap-2">
                            {endpoint.auth === 'JWT' ? (
                              <Lock className="w-3 h-3 text-blue-400" />
                            ) : (
                              <Globe className="w-3 h-3 text-gray-500" />
                            )}
                            <span className={`text-[11px] font-bold ${endpoint.auth === 'JWT' ? 'text-blue-400' : 'text-gray-500'}`}>
                              {endpoint.auth}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 max-w-xs">
                          <p className="text-gray-400 text-sm leading-relaxed">{endpoint.desc}</p>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(endpoint.path)}
                            className="bg-white/5 hover:bg-[#F2A900] hover:text-black transition-all duration-300 rounded-lg group/btn"
                          >
                            {copiedPath === endpoint.path ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <BookOpen className="w-12 h-12 opacity-20" />
                        <p>No endpoints found matching "{searchTerm}"</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer of card */}
          <div className="p-8 bg-gradient-to-r from-[#1a1a1a] to-[#111111] border-t border-[#F2A900]/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F2A900]/10 rounded-xl">
                <Coffee className="w-6 h-6 text-[#F2A900]" />
              </div>
              <div>
                <p className="text-white font-bold">Need assistance?</p>
                <p className="text-gray-400 text-sm">Join our developer community for support.</p>
              </div>
            </div>
            <Button
              onClick={() => window.open('mailto:dev@bashafood.in')}
              className="bg-[#F2A900] text-black hover:bg-[#D99700] font-black uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Contact Developer Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
