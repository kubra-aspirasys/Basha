import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

export default function Account() {
  const { user, logout, updateProfile, changePassword } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: (user && 'address' in user ? user.address : '') || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const success = await changePassword(passwordData);
    if (success) {
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to change password. Check your current password.",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const success = await updateProfile({ avatar_url: base64String });
      setIsUploading(false);
      if (success) {
        toast({
          title: "Success",
          description: "Profile picture updated",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 underline decoration-[#F2A900]/50 underline-offset-8">My Account</h1>
            <p className="text-gray-400">Manage your profile and security settings</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
          >
            Logout
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Profile Card */}
          <div className="bg-[#1a1a1a] border border-[#F2A900]/20 rounded-2xl overflow-hidden shadow-2xl shadow-[#F2A900]/5">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#F2A900]/15 via-[#F2A900]/5 to-transparent p-8 border-b border-[#F2A900]/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 bg-[#0f0f0f] rounded-full flex items-center justify-center border-4 border-[#F2A900]/30 overflow-hidden relative">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-[#F2A900]/50" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#F2A900] border-transparent" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 p-2.5 bg-[#F2A900] text-black rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group-hover:bg-[#D99700]"
                  >
                    <Camera className="w-5 h-5 flex-shrink-0" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1 group-hover:text-[#F2A900] transition-colors">{user.name}</h2>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`${isEditing
                        ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20'
                        : 'bg-[#F2A900] text-black hover:bg-[#D99700] hover:shadow-[0_0_20px_rgba(242,169,0,0.3)]'
                        } font-bold px-8 py-6 rounded-xl transition-all duration-300 transform active:scale-95`}
                    >
                      {isEditing ? (
                        <><X className="w-5 h-5 mr-2" /> Cancel</>
                      ) : (
                        <><Edit2 className="w-5 h-5 mr-2" /> Edit Profile</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 space-y-8 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#F2A900]/70 text-sm font-medium uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] transition-all"
                    />
                  ) : (
                    <p className="text-white text-xl font-semibold bg-[#0f0f0f] px-5 py-4 rounded-xl border border-[#F2A900]/10">{user.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#F2A900]/70 text-sm font-medium uppercase tracking-wider">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] transition-all"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-white text-xl font-semibold bg-[#0f0f0f] px-5 py-4 rounded-xl border border-[#F2A900]/10">{user.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[#F2A900]/70 text-sm font-medium uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] transition-all"
                    rows={4}
                    placeholder="Enter your complete delivery address"
                  />
                ) : (
                  <p className="text-white text-xl font-semibold bg-[#0f0f0f] px-5 py-4 rounded-xl border border-[#F2A900]/10 leading-relaxed group">
                    {(user && 'address' in user ? user.address : null) || 'No address saved yet'}
                  </p>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="w-full bg-[#F2A900] hover:bg-[#D99700] text-black font-extrabold py-8 text-xl rounded-xl shadow-[0_10px_30px_rgba(242,169,0,0.2)] transition-all duration-300 active:scale-95"
                >
                  <Save className="w-6 h-6 mr-3" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          {/* Security & Actions Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Password Management */}
            <div className="bg-[#1a1a1a] border border-[#F2A900]/20 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Security</h3>
              </div>

              {!showPasswordForm ? (
                <div className="space-y-4">
                  <p className="text-gray-400 leading-relaxed">Keep your account secure by updating your password regularly.</p>
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    variant="outline"
                    className="w-full border-[#F2A900]/50 text-[#F2A900] hover:bg-[#F2A900] hover:text-black font-bold py-6 rounded-xl transition-all duration-300"
                  >
                    <Lock className="w-5 h-5 mr-3" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900]"
                      required
                    />
                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900]"
                      required
                    />
                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#F2A900]/20 rounded-xl text-white focus:outline-none focus:border-[#F2A900]"
                      required
                    />
                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
                    >
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Stats/Orders */}
            <div className="bg-[#1a1a1a] border border-[#F2A900]/20 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Order History</h3>
                </div>
                <p className="text-gray-400 leading-relaxed mb-8">View your past orders, track live deliveries, and reorder your favorites with one click.</p>
              </div>
              <Button
                onClick={() => navigate('/orders')}
                className="w-full bg-transparent border-2 border-[#F2A900] text-[#F2A900] hover:bg-[#F2A900] hover:text-black font-extrabold py-6 rounded-xl transition-all duration-500 group"
              >
                Go to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        variant="customer"
      />
    </div>
  );
}
