import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

export default function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: (user && 'address' in user ? user.address : '') || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    // TODO: Update user profile via API
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#F2A900]/20 to-[#F2A900]/5 p-8 border-b border-[#F2A900]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[#F2A900]/20 rounded-full flex items-center justify-center border-4 border-[#F2A900]/40">
                  <User className="w-12 h-12 text-[#F2A900]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={`${
                  isEditing
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#F2A900] hover:bg-[#D99700]'
                } text-white font-semibold px-6`}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/30 rounded-lg text-white focus:outline-none focus:border-[#F2A900]"
                />
              ) : (
                <p className="text-white text-lg font-medium">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/30 rounded-lg text-white focus:outline-none focus:border-[#F2A900]"
                />
              ) : (
                <p className="text-white text-lg font-medium">{user.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/30 rounded-lg text-white focus:outline-none focus:border-[#F2A900]"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-white text-lg font-medium">{user.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/30 rounded-lg text-white focus:outline-none focus:border-[#F2A900]"
                  rows={3}
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-white text-lg font-medium">{(user && 'address' in user ? user.address : null) || 'Not provided'}</p>
              )}
            </div>

            {/* Save Button (only shown when editing) */}
            {isEditing && (
              <Button
                onClick={handleSave}
                className="w-full bg-[#F2A900] hover:bg-[#D99700] text-black font-bold py-6 text-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Order History</h3>
            <p className="text-gray-400 mb-4">View your past orders and track current orders</p>
            <Button
              onClick={() => navigate('/orders')}
              variant="outline"
              className="w-full border-[#F2A900] text-[#F2A900] hover:bg-[#F2A900]/10"
            >
              View Orders
            </Button>
          </div>

          <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Security</h3>
            <p className="text-gray-400 mb-4">Change your password and security settings</p>
            <Button
              variant="outline"
              className="w-full border-[#F2A900] text-[#F2A900] hover:bg-[#F2A900]/10"
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/20 px-8"
          >
            Logout from Account
          </Button>
        </div>
      </div>
    </div>
  );
}


