import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera, Crop } from 'lucide-react';

export default function Profile() {
  const { user: admin, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully',
    });
  };

  const changePassword = useAuthStore((state) => state.changePassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });

    if (success) {
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please check your current password.',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropImage(result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleCropComplete = (croppedImage: string) => {
    setPreviewImage(croppedImage);
    setShowCropModal(false);
    setCropImage(null);
  };

  const handleSaveImage = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload to a cloud service like AWS S3, Cloudinary, etc.
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateProfile({ ...formData, avatar_url: previewImage });
      setPreviewImage(null);

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to update profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    updateProfile({ ...formData, avatar_url: '' });
    toast({
      title: 'Profile picture removed',
      description: 'Your profile picture has been removed',
    });
  };

  const handleCancelImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  if (!admin) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
            <div
              className={`relative group cursor-pointer transition-all duration-200 ${isDragOver ? 'scale-105 ring-4 ring-gold-500 ring-opacity-50' : ''
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Avatar className="w-24 h-24 ring-4 ring-slate-200 dark:ring-slate-700">
                <AvatarImage src={previewImage || admin.avatar_url} />
                <AvatarFallback className="bg-gold-500 text-white text-2xl">
                  {admin.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/90 hover:bg-white text-slate-900"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* Drag overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-gold-500/20 rounded-full flex items-center justify-center">
                  <div className="text-center text-gold-600">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop image here</p>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                {admin.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{admin.email}</p>

              {/* Image upload controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs w-full sm:w-auto"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Photo
                </Button>
                {admin.avatar_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Image preview and save controls */}
          {previewImage && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    New Profile Picture
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click save to update your profile picture
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveImage}
                    disabled={isUploading}
                    className="bg-gold-500 hover:bg-gold-600"
                  >
                    {isUploading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelImage}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: admin?.name || '',
                      email: admin?.email || '',
                      phone: admin?.phone || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                  <p className="font-medium">{admin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-medium">{admin.phone || 'Not provided'}</p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gold-500 hover:bg-gold-600"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="bg-gold-500 hover:bg-gold-600">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>


      {/* Crop Modal */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Crop className="w-5 h-5" />
                Crop Profile Picture
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCropModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <img
                  src={cropImage}
                  alt="Crop preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg border border-slate-200 dark:border-slate-600"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Drag to reposition and resize your profile picture
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCropComplete(cropImage)}
                  className="bg-gold-500 hover:bg-gold-600"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Crop & Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
