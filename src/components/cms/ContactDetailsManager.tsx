import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Plus,
  Trash2,
  Phone,
  // Mail, 
  MapPin,
  Clock,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Eye,
  Edit3,
  Map
} from 'lucide-react';

interface ContactDetails {
  hero: {
    title: string;
    description: string;
  };
  form: {
    fields: {
      fullName: { enabled: boolean; required: boolean; label: string; placeholder: string };
      email: { enabled: boolean; required: boolean; label: string; placeholder: string };
      phone: { enabled: boolean; required: boolean; label: string; placeholder: string };
      eventDate: { enabled: boolean; required: boolean; label: string; placeholder: string };
      eventType: { enabled: boolean; required: boolean; label: string; placeholder: string; options: string[] };
      guestCount: { enabled: boolean; required: boolean; label: string; placeholder: string };
      additionalDetails: { enabled: boolean; required: boolean; label: string; placeholder: string };
    };
    submitButton: {
      text: string;
      style: string;
    };
  };
  contactInfo: {
    phones: Array<{ id: string; number: string; label: string; primary: boolean }>;
    emails: Array<{ id: string; email: string; label: string; primary: boolean }>;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  businessHours: {
    weekdays: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
    timezone: string;
    holidayHours: string;
    specialHours: string;
  };
  socialMedia: {
    whatsapp: { number: string; message: string; buttonText: string };
    socialLinks: Array<{ id: string; platform: string; url: string; enabled: boolean }>;
    quickContact: {
      callButton: { enabled: boolean; text: string };
      emailButton: { enabled: boolean; text: string };
      whatsappButton: { enabled: boolean; text: string };
    };
  };
  map: {
    enabled: boolean;
    iframeCode: string;
    address: string;
    directionsLink: string;
    parkingInfo: string;
  };
}

const defaultContactDetails: ContactDetails = {
  hero: {
    title: "Contact Us",
    description: "Have questions about our catering services? We're here to help you plan the perfect event with delicious food and exceptional service."
  },
  form: {
    fields: {
      fullName: { enabled: true, required: true, label: "Full Name", placeholder: "Enter your full name" },
      email: { enabled: true, required: true, label: "Email Address", placeholder: "Enter your email" },
      phone: { enabled: true, required: true, label: "Phone Number", placeholder: "Enter your phone number" },
      eventDate: { enabled: true, required: false, label: "Event Date", placeholder: "dd-mm-yyyy" },
      eventType: { enabled: true, required: false, label: "Event Type", placeholder: "Select event type", options: ["Wedding", "Corporate Event", "Birthday Party", "Anniversary", "Other"] },
      guestCount: { enabled: true, required: false, label: "Number of Guests", placeholder: "Approximate guest count" },
      additionalDetails: { enabled: true, required: false, label: "Additional Details", placeholder: "Tell us about your event requirements, dietary preferences, or any special requests..." }
    },
    submitButton: {
      text: "Send Inquiry",
      style: "primary"
    }
  },
  contactInfo: {
    phones: [
      { id: "1", number: "+91 98765 43210", label: "Primary", primary: true },
      { id: "2", number: "+91 87654 32109", label: "Secondary", primary: false }
    ],
    emails: [
      { id: "1", email: "info@srfoodkraft.com", label: "General", primary: true },
      { id: "2", email: "orders@srfoodkraft.com", label: "Orders", primary: false }
    ],
    address: {
      street: "123 Catering Street",
      city: "Food District",
      state: "City",
      postalCode: "560001",
      country: "India"
    }
  },
  businessHours: {
    weekdays: { open: "09:00", close: "20:00", enabled: true },
    sunday: { open: "10:00", close: "18:00", enabled: true },
    timezone: "Asia/Kolkata",
    holidayHours: "Closed on public holidays",
    specialHours: "Extended hours available for special events"
  },
  socialMedia: {
    whatsapp: {
      number: "+91 98765 43210",
      message: "Hi! I'm interested in your catering services.",
      buttonText: "Chat on WhatsApp"
    },
    socialLinks: [
      { id: "1", platform: "Facebook", url: "https://facebook.com/srfoodkraft", enabled: true },
      { id: "2", platform: "Instagram", url: "https://instagram.com/srfoodkraft", enabled: true },
      { id: "3", platform: "Twitter", url: "https://twitter.com/srfoodkraft", enabled: false },
      { id: "4", platform: "LinkedIn", url: "https://linkedin.com/company/srfoodkraft", enabled: false },
      { id: "5", platform: "YouTube", url: "https://youtube.com/srfoodkraft", enabled: false }
    ],
    quickContact: {
      callButton: { enabled: true, text: "Call Now" },
      emailButton: { enabled: true, text: "Send Email" },
      whatsappButton: { enabled: true, text: "WhatsApp" }
    }
  },
  map: {
    enabled: true,
    iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15546.963658733295!2d80.22039502859116!3d13.052156548496034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5266f674bb2e27%3A0x4b56916abea703e2!2sKodambakkam!5e0!3m2!1sen!2sin!4v1759311582195!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    address: "123 Catering Street, Food District, City 560001",
    directionsLink: "https://maps.google.com/?q=123+Catering+Street+Food+District",
    parkingInfo: "Free parking available in front of the building"
  }
};

export default function ContactDetailsManager() {
  const [contactDetails, setContactDetails] = useState<ContactDetails>(defaultContactDetails);
  const [activeSection, setActiveSection] = useState<'hero' | 'form' | 'contact' | 'hours' | 'social' | 'map'>('hero');
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: 'Contact Details Updated',
      description: 'Your contact page settings have been saved successfully',
    });
  };

  const addPhone = () => {
    const newPhone = {
      id: Date.now().toString(),
      number: '',
      label: 'Additional',
      primary: false
    };
    setContactDetails(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        phones: [...prev.contactInfo.phones, newPhone]
      }
    }));
  };

  const removePhone = (id: string) => {
    setContactDetails(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        phones: prev.contactInfo.phones.filter(phone => phone.id !== id)
      }
    }));
  };

  const addEmail = () => {
    const newEmail = {
      id: Date.now().toString(),
      email: '',
      label: 'Additional',
      primary: false
    };
    setContactDetails(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        emails: [...prev.contactInfo.emails, newEmail]
      }
    }));
  };

  const removeEmail = (id: string) => {
    setContactDetails(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        emails: prev.contactInfo.emails.filter(email => email.id !== id)
      }
    }));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return Facebook;
      case 'Instagram': return Instagram;
      case 'Twitter': return Twitter;
      case 'LinkedIn': return Linkedin;
      case 'YouTube': return Youtube;
      default: return Globe;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Contact Details CMS</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your contact page content and settings</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
            <span className="sm:hidden">{previewMode ? 'Edit' : 'Preview'}</span>
          </Button>
          <Button onClick={handleSave} className="bg-gold-500 hover:bg-gold-600 w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'hero', label: 'Hero Section', icon: Globe },
            { id: 'form', label: 'Contact Form', icon: Edit3 },
            { id: 'contact', label: 'Contact Info', icon: Phone },
            { id: 'hours', label: 'Business Hours', icon: Clock },
            { id: 'social', label: 'Social & Communication', icon: MessageSquare },
            { id: 'map', label: 'Interactive Map', icon: Map }
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${activeSection === section.id
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-center leading-tight">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Hero Section */}
        {activeSection === 'hero' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Page Title</Label>
                <Input
                  id="hero-title"
                  value={contactDetails.hero.title}
                  onChange={(e) => setContactDetails(prev => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value }
                  }))}
                  placeholder="Contact Us"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-description">Main Description</Label>
                <Textarea
                  id="hero-description"
                  value={contactDetails.hero.description}
                  onChange={(e) => setContactDetails(prev => ({
                    ...prev,
                    hero: { ...prev.hero, description: e.target.value }
                  }))}
                  placeholder="Describe your catering services..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Form */}
        {activeSection === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Contact Form Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Form Fields</h4>
                {Object.entries(contactDetails.form.fields).map(([key, field]) => (
                  <div key={key} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h5>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.enabled}
                            onCheckedChange={(checked) => setContactDetails(prev => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                fields: {
                                  ...prev.form.fields,
                                  [key]: { ...field, enabled: checked }
                                }
                              }
                            }))}
                          />
                          <Label>Show Field</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => setContactDetails(prev => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                fields: {
                                  ...prev.form.fields,
                                  [key]: { ...field, required: checked }
                                }
                              }
                            }))}
                          />
                          <Label>Required</Label>
                        </div>
                      </div>
                    </div>
                    {field.enabled && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                fields: {
                                  ...prev.form.fields,
                                  [key]: { ...field, label: e.target.value }
                                }
                              }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Placeholder Text</Label>
                          <Input
                            value={field.placeholder}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                fields: {
                                  ...prev.form.fields,
                                  [key]: { ...field, placeholder: e.target.value }
                                }
                              }
                            }))}
                          />
                        </div>
                        {key === 'eventType' && 'options' in field && (
                          <div className="md:col-span-2 space-y-2">
                            <Label>Dropdown Options</Label>
                            <div className="space-y-2">
                              {field.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...field.options];
                                      newOptions[index] = e.target.value;
                                      setContactDetails(prev => ({
                                        ...prev,
                                        form: {
                                          ...prev.form,
                                          fields: {
                                            ...prev.form.fields,
                                            [key]: { ...field, options: newOptions }
                                          }
                                        }
                                      }));
                                    }}
                                    placeholder="Option text"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = field.options.filter((_, i) => i !== index);
                                      setContactDetails(prev => ({
                                        ...prev,
                                        form: {
                                          ...prev.form,
                                          fields: {
                                            ...prev.form.fields,
                                            [key]: { ...field, options: newOptions }
                                          }
                                        }
                                      }));
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newOptions = [...field.options, ''];
                                  setContactDetails(prev => ({
                                    ...prev,
                                    form: {
                                      ...prev.form,
                                      fields: {
                                        ...prev.form.fields,
                                        [key]: { ...field, options: newOptions }
                                      }
                                    }
                                  }));
                                }}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Submit Button</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={contactDetails.form.submitButton.text}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          submitButton: { ...prev.form.submitButton, text: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Style</Label>
                    <Select
                      value={contactDetails.form.submitButton.style}
                      onValueChange={(value) => setContactDetails(prev => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          submitButton: { ...prev.form.submitButton, style: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {activeSection === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phone Numbers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-semibold">Phone Numbers</h4>
                  <Button onClick={addPhone} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phone
                  </Button>
                </div>
                <div className="space-y-3">
                  {contactDetails.contactInfo.phones.map((phone) => (
                    <div key={phone.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <Input
                          value={phone.number}
                          onChange={(e) => setContactDetails(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              phones: prev.contactInfo.phones.map(p =>
                                p.id === phone.id ? { ...p, number: e.target.value } : p
                              )
                            }
                          }))}
                          placeholder="Phone number"
                        />
                        <Input
                          value={phone.label}
                          onChange={(e) => setContactDetails(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              phones: prev.contactInfo.phones.map(p =>
                                p.id === phone.id ? { ...p, label: e.target.value } : p
                              )
                            }
                          }))}
                          placeholder="Label (e.g., Primary)"
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={phone.primary}
                            onCheckedChange={(checked) => setContactDetails(prev => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                phones: prev.contactInfo.phones.map(p =>
                                  p.id === phone.id ? { ...p, primary: checked } : { ...p, primary: false }
                                )
                              }
                            }))}
                          />
                          <Label>Primary</Label>
                        </div>
                      </div>
                      {contactDetails.contactInfo.phones.length > 1 && (
                        <Button
                          onClick={() => removePhone(phone.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Addresses */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-semibold">Email Addresses</h4>
                  <Button onClick={addEmail} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Email
                  </Button>
                </div>
                <div className="space-y-3">
                  {contactDetails.contactInfo.emails.map((email) => (
                    <div key={email.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <Input
                          value={email.email}
                          onChange={(e) => setContactDetails(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              emails: prev.contactInfo.emails.map(em =>
                                em.id === email.id ? { ...em, email: e.target.value } : em
                              )
                            }
                          }))}
                          placeholder="Email address"
                        />
                        <Input
                          value={email.label}
                          onChange={(e) => setContactDetails(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              emails: prev.contactInfo.emails.map(em =>
                                em.id === email.id ? { ...em, label: e.target.value } : em
                              )
                            }
                          }))}
                          placeholder="Label (e.g., General)"
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={email.primary}
                            onCheckedChange={(checked) => setContactDetails(prev => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                emails: prev.contactInfo.emails.map(e =>
                                  e.id === email.id ? { ...e, primary: checked } : { ...e, primary: false }
                                )
                              }
                            }))}
                          />
                          <Label>Primary</Label>
                        </div>
                      </div>
                      {contactDetails.contactInfo.emails.length > 1 && (
                        <Button
                          onClick={() => removeEmail(email.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Address */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Physical Address</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      value={contactDetails.contactInfo.address.street}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          address: { ...prev.contactInfo.address, street: e.target.value }
                        }
                      }))}
                      placeholder="123 Catering Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={contactDetails.contactInfo.address.city}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          address: { ...prev.contactInfo.address, city: e.target.value }
                        }
                      }))}
                      placeholder="Food District"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={contactDetails.contactInfo.address.state}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          address: { ...prev.contactInfo.address, state: e.target.value }
                        }
                      }))}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={contactDetails.contactInfo.address.postalCode}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          address: { ...prev.contactInfo.address, postalCode: e.target.value }
                        }
                      }))}
                      placeholder="560001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={contactDetails.contactInfo.address.country}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          address: { ...prev.contactInfo.address, country: e.target.value }
                        }
                      }))}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Hours */}
        {activeSection === 'hours' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold">Regular Hours</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Monday - Saturday</Label>
                      <Switch
                        checked={contactDetails.businessHours.weekdays.enabled}
                        onCheckedChange={(checked) => setContactDetails(prev => ({
                          ...prev,
                          businessHours: {
                            ...prev.businessHours,
                            weekdays: { ...prev.businessHours.weekdays, enabled: checked }
                          }
                        }))}
                      />
                    </div>
                    {contactDetails.businessHours.weekdays.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Opening Time</Label>
                          <Input
                            type="time"
                            value={contactDetails.businessHours.weekdays.open}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                weekdays: { ...prev.businessHours.weekdays, open: e.target.value }
                              }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Closing Time</Label>
                          <Input
                            type="time"
                            value={contactDetails.businessHours.weekdays.close}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                weekdays: { ...prev.businessHours.weekdays, close: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Sunday</Label>
                      <Switch
                        checked={contactDetails.businessHours.sunday.enabled}
                        onCheckedChange={(checked) => setContactDetails(prev => ({
                          ...prev,
                          businessHours: {
                            ...prev.businessHours,
                            sunday: { ...prev.businessHours.sunday, enabled: checked }
                          }
                        }))}
                      />
                    </div>
                    {contactDetails.businessHours.sunday.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Opening Time</Label>
                          <Input
                            type="time"
                            value={contactDetails.businessHours.sunday.open}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                sunday: { ...prev.businessHours.sunday, open: e.target.value }
                              }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Closing Time</Label>
                          <Input
                            type="time"
                            value={contactDetails.businessHours.sunday.close}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                sunday: { ...prev.businessHours.sunday, close: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold">Additional Information</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={contactDetails.businessHours.timezone}
                        onValueChange={(value) => setContactDetails(prev => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, timezone: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Holiday Hours</Label>
                      <Textarea
                        value={contactDetails.businessHours.holidayHours}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, holidayHours: e.target.value }
                        }))}
                        placeholder="Closed on public holidays"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Special Hours</Label>
                      <Textarea
                        value={contactDetails.businessHours.specialHours}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, specialHours: e.target.value }
                        }))}
                        placeholder="Extended hours available for special events"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media & Communication */}
        {activeSection === 'social' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Social Media & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp Integration */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">WhatsApp Integration</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={contactDetails.socialMedia.whatsapp.number}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          whatsapp: { ...prev.socialMedia.whatsapp, number: e.target.value }
                        }
                      }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={contactDetails.socialMedia.whatsapp.buttonText}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          whatsapp: { ...prev.socialMedia.whatsapp, buttonText: e.target.value }
                        }
                      }))}
                      placeholder="Chat on WhatsApp"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Message</Label>
                  <Textarea
                    value={contactDetails.socialMedia.whatsapp.message}
                    onChange={(e) => setContactDetails(prev => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        whatsapp: { ...prev.socialMedia.whatsapp, message: e.target.value }
                      }
                    }))}
                    placeholder="Hi! I'm interested in your catering services."
                    rows={2}
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Social Media Links</h4>
                <div className="space-y-3">
                  {contactDetails.socialMedia.socialLinks.map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <div key={link.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <Icon className="w-5 h-5 text-slate-500" />
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <Input
                            value={link.url}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              socialMedia: {
                                ...prev.socialMedia,
                                socialLinks: prev.socialMedia.socialLinks.map(l =>
                                  l.id === link.id ? { ...l, url: e.target.value } : l
                                )
                              }
                            }))}
                            placeholder={`${link.platform} URL`}
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={link.enabled}
                              onCheckedChange={(checked) => setContactDetails(prev => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  socialLinks: prev.socialMedia.socialLinks.map(l =>
                                    l.id === link.id ? { ...l, enabled: checked } : l
                                  )
                                }
                              }))}
                            />
                            <Label>Enabled</Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Quick Contact Buttons</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Call Button</Label>
                      <Switch
                        checked={contactDetails.socialMedia.quickContact.callButton.enabled}
                        onCheckedChange={(checked) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              callButton: { ...prev.socialMedia.quickContact.callButton, enabled: checked }
                            }
                          }
                        }))}
                      />
                    </div>
                    {contactDetails.socialMedia.quickContact.callButton.enabled && (
                      <Input
                        value={contactDetails.socialMedia.quickContact.callButton.text}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              callButton: { ...prev.socialMedia.quickContact.callButton, text: e.target.value }
                            }
                          }
                        }))}
                        placeholder="Call Now"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Email Button</Label>
                      <Switch
                        checked={contactDetails.socialMedia.quickContact.emailButton.enabled}
                        onCheckedChange={(checked) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              emailButton: { ...prev.socialMedia.quickContact.emailButton, enabled: checked }
                            }
                          }
                        }))}
                      />
                    </div>
                    {contactDetails.socialMedia.quickContact.emailButton.enabled && (
                      <Input
                        value={contactDetails.socialMedia.quickContact.emailButton.text}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              emailButton: { ...prev.socialMedia.quickContact.emailButton, text: e.target.value }
                            }
                          }
                        }))}
                        placeholder="Send Email"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>WhatsApp Button</Label>
                      <Switch
                        checked={contactDetails.socialMedia.quickContact.whatsappButton.enabled}
                        onCheckedChange={(checked) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              whatsappButton: { ...prev.socialMedia.quickContact.whatsappButton, enabled: checked }
                            }
                          }
                        }))}
                      />
                    </div>
                    {contactDetails.socialMedia.quickContact.whatsappButton.enabled && (
                      <Input
                        value={contactDetails.socialMedia.quickContact.whatsappButton.text}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            quickContact: {
                              ...prev.socialMedia.quickContact,
                              whatsappButton: { ...prev.socialMedia.quickContact.whatsappButton, text: e.target.value }
                            }
                          }
                        }))}
                        placeholder="WhatsApp"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interactive Map */}
        {activeSection === 'map' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Map Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure your interactive map display</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={contactDetails.map.enabled}
                    onCheckedChange={(checked) => setContactDetails(prev => ({
                      ...prev,
                      map: { ...prev.map, enabled: checked }
                    }))}
                  />
                  <Label>Enable Map</Label>
                </div>
              </div>

              {contactDetails.map.enabled && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold">Google Maps Embed Code</h5>
                    <div className="space-y-2">
                      <Label>Iframe Code</Label>
                      <Textarea
                        value={contactDetails.map.iframeCode}
                        onChange={(e) => setContactDetails(prev => ({
                          ...prev,
                          map: { ...prev.map, iframeCode: e.target.value }
                        }))}
                        placeholder="Paste your Google Maps iframe code here..."
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paste the iframe code from Google Maps embed feature
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold">Location Details</h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Display Address</Label>
                          <Textarea
                            value={contactDetails.map.address}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              map: { ...prev.map, address: e.target.value }
                            }))}
                            placeholder="123 Catering Street, Food District, City 560001"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Directions Link</Label>
                          <Input
                            value={contactDetails.map.directionsLink}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              map: { ...prev.map, directionsLink: e.target.value }
                            }))}
                            placeholder="https://maps.google.com/?q=your+address"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold">Additional Information</h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Parking Information</Label>
                          <Textarea
                            value={contactDetails.map.parkingInfo}
                            onChange={(e) => setContactDetails(prev => ({
                              ...prev,
                              map: { ...prev.map, parkingInfo: e.target.value }
                            }))}
                            placeholder="Free parking available in front of the building"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="space-y-3">
                    <h5 className="font-semibold">Map Preview</h5>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                      {contactDetails.map.iframeCode ? (
                        <div
                          className="w-full h-64 rounded-lg overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: contactDetails.map.iframeCode }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <div className="text-center">
                            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                              Paste your Google Maps iframe code above to see preview
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
