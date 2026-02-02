import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  // Play,
  // Pause,
  Settings,
  Eye,
  Edit3,
  Home,
  Star,
  MessageSquare
} from 'lucide-react';

interface HeroImage {
  id: string;
  desktop: string;
  mobile: string;
  alt: string;
  order: number;
}

interface FeatureBadge {
  id: string;
  text: string;
  icon: string;
  color: string;
  enabled: boolean;
}

interface HomepageHero {
  title: string;
  subtitle: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
    enabled: boolean;
  };
  secondaryButton: {
    text: string;
    link: string;
    enabled: boolean;
  };
  backgroundImages: HeroImage[];
  isCarousel: boolean;
  carouselSettings: {
    autoplay: boolean;
    autoplayDelay: number;
    showIndicators: boolean;
    showArrows: boolean;
  };
  featureBadges: FeatureBadge[];
  overlay: {
    enabled: boolean;
    opacity: number;
    color: string;
  };
  featuredSection: {
    badgeText: string;
    sectionTitle: string;
    enabled: boolean;
  };
  exploreMenuSection: {
    badgeText: string;
    sectionTitle: string;
    buttonText: string;
    buttonLink: string;
    enabled: boolean;
  };
  eventsSection: {
    badgeText: string;
    sectionTitle: string;
    description: string;
    enabled: boolean;
    background: {
      type: 'color' | 'image';
      color: string;
      image: string;
      opacity: number;
    };
    eventTypes: Array<{
      id: string;
      title: string;
      description: string;
      services: string[];
      buttonText: string;
      buttonLink: string;
      image: string;
      enabled: boolean;
    }>;
  };
  testimonialsSection: {
    badgeText: string;
    sectionTitle: string;
    description: string;
    enabled: boolean;
    testimonials: Array<{
      id: string;
      name: string;
      eventType: string;
      quote: string;
      rating: number;
      enabled: boolean;
    }>;
  };
  ctaSection: {
    headline: string;
    description: string;
    primaryButton: {
      text: string;
      link: string;
      enabled: boolean;
    };
    secondaryButton: {
      text: string;
      link: string;
      enabled: boolean;
    };
    background: {
      type: 'color' | 'gradient';
      color: string;
      gradient: string;
    };
    enabled: boolean;
  };
}

const defaultHomepageHero: HomepageHero = {
  title: "Welcome to SR FoodKraft",
  subtitle: "Premium Catering",
  description: "Crafting exceptional culinary experiences for your most precious moments. Fresh, authentic, and unforgettable.",
  primaryButton: {
    text: "Explore Our Menu",
    link: "/menu",
    enabled: true
  },
  secondaryButton: {
    text: "Get Custom Quote",
    link: "/contact",
    enabled: true
  },
  backgroundImages: [
    {
      id: "1",
      desktop: "/banner.jpeg",
      mobile: "/banner.jpeg",
      alt: "Premium catering service",
      order: 1
    }
  ],
  isCarousel: false,
  carouselSettings: {
    autoplay: true,
    autoplayDelay: 5000,
    showIndicators: true,
    showArrows: true
  },
  featureBadges: [
    {
      id: "1",
      text: "Prepared fresh after order",
      icon: "🍃",
      color: "green",
      enabled: true
    },
    {
      id: "2",
      text: "Premium quality guaranteed",
      icon: "⭐",
      color: "purple",
      enabled: true
    }
  ],
  overlay: {
    enabled: true,
    opacity: 0.4,
    color: "black"
  },
  featuredSection: {
    badgeText: "Featured Today",
    sectionTitle: "Featured Menu of the Day",
    enabled: true
  },
  exploreMenuSection: {
    badgeText: "Explore Menu",
    sectionTitle: "Explore Our Menu",
    buttonText: "View Full Menu",
    buttonLink: "/menu",
    enabled: true
  },
  eventsSection: {
    badgeText: "Premium Events",
    sectionTitle: "Events We Cater",
    description: "From intimate gatherings to grand celebrations, we bring culinary excellence to every occasion.",
    enabled: true,
    background: {
      type: 'color',
      color: '#f8fafc',
      image: '',
      opacity: 1
    },
    eventTypes: [
      {
        id: "1",
        title: "Wedding Catering",
        description: "Make your special day unforgettable with our premium wedding catering services.",
        services: ["Custom Menu Planning", "Professional Setup", "Live Cooking Stations", "Wedding Specialists"],
        buttonText: "Contact Us",
        buttonLink: "/contact",
        image: "/Wedding Catering.jpeg",
        enabled: true
      },
      {
        id: "2",
        title: "Corporate Events",
        description: "Impress your clients and colleagues with our professional corporate catering.",
        services: ["Business Lunch Packages", "Conference Catering", "Team Building Events", "Executive Dining"],
        buttonText: "Contact Us",
        buttonLink: "/contact",
        image: "/Corporate Events.jpeg",
        enabled: true
      },
      {
        id: "3",
        title: "Private Parties",
        description: "Celebrate life's moments with our personalized private party catering.",
        services: ["Birthday Celebrations", "Anniversary Parties", "Family Gatherings", "Custom Menus"],
        buttonText: "Contact Us",
        buttonLink: "/contact",
        image: "/Private Parties.jpeg",
        enabled: true
      }
    ]
  },
  testimonialsSection: {
    badgeText: "Customer Stories",
    sectionTitle: "What Our Clients Say",
    description: "Hear from our satisfied customers about their exceptional catering experiences.",
    enabled: true,
    testimonials: [
      {
        id: "1",
        name: "Priya Sharma",
        eventType: "Wedding Reception",
        quote: "Outstanding catering service! The food was delicious and the presentation was perfect.",
        rating: 5,
        enabled: true
      },
      {
        id: "2",
        name: "Rajesh Kumar",
        eventType: "Corporate Event",
        quote: "Professional service and amazing taste. Our guests were thoroughly impressed.",
        rating: 5,
        enabled: true
      },
      {
        id: "3",
        name: "Anita Patel",
        eventType: "Birthday Party",
        quote: "Exceptional quality and timely delivery. Will definitely book again!",
        rating: 5,
        enabled: true
      }
    ]
  },
  ctaSection: {
    headline: "Ready to Create Magic?",
    description: "Let us transform your event into an unforgettable culinary experience. Book your consultation today.",
    primaryButton: {
      text: "Start Planning",
      link: "/contact",
      enabled: true
    },
    secondaryButton: {
      text: "View Full Menu",
      link: "/menu",
      enabled: true
    },
    background: {
      type: 'gradient',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
    },
    enabled: true
  }
};

export default function HomepageHeroManager() {
  const [homepageHero, setHomepageHero] = useState<HomepageHero>(defaultHomepageHero);
  const [activeTab, setActiveTab] = useState<'hero' | 'featured' | 'explore' | 'events' | 'testimonials' | 'cta' | 'settings'>('hero');
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: 'Homepage Hero Updated',
      description: 'Your homepage hero section has been saved successfully',
    });
  };

  const addImage = () => {
    const newImage: HeroImage = {
      id: Date.now().toString(),
      desktop: '',
      mobile: '',
      alt: '',
      order: homepageHero.backgroundImages.length + 1
    };
    setHomepageHero(prev => ({
      ...prev,
      backgroundImages: [...prev.backgroundImages, newImage]
    }));
  };

  const removeImage = (id: string) => {
    setHomepageHero(prev => ({
      ...prev,
      backgroundImages: prev.backgroundImages.filter(img => img.id !== id)
    }));
  };

  const updateImageOrder = (id: string, direction: 'up' | 'down') => {
    setHomepageHero(prev => {
      const images = [...prev.backgroundImages];
      const index = images.findIndex(img => img.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return prev;

      [images[index], images[newIndex]] = [images[newIndex], images[index]];
      images.forEach((img, i) => { img.order = i + 1; });

      return { ...prev, backgroundImages: images };
    });
  };

  const addFeatureBadge = () => {
    const newBadge: FeatureBadge = {
      id: Date.now().toString(),
      text: '',
      icon: '⭐',
      color: 'blue',
      enabled: true
    };
    setHomepageHero(prev => ({
      ...prev,
      featureBadges: [...prev.featureBadges, newBadge]
    }));
  };

  const removeFeatureBadge = (id: string) => {
    setHomepageHero(prev => ({
      ...prev,
      featureBadges: prev.featureBadges.filter(badge => badge.id !== id)
    }));
  };

  const getBadgeColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Homepage CMS</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your homepage content, hero section, and images</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {[
            { id: 'hero', label: 'Hero Section', icon: Edit3 },
            { id: 'featured', label: 'Featured Section', icon: Star },
            { id: 'explore', label: 'Explore Menu', icon: Home },
            { id: 'events', label: 'Events We Cater', icon: Star },
            { id: 'testimonials', label: 'Customer Stories', icon: MessageSquare },
            { id: 'cta', label: 'Call to Action', icon: Star },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${activeTab === tab.id
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Hero Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Main Title</Label>
                      <Input
                        value={homepageHero.title}
                        onChange={(e) => setHomepageHero(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="Welcome to SR FoodKraft"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={homepageHero.subtitle}
                        onChange={(e) => setHomepageHero(prev => ({
                          ...prev,
                          subtitle: e.target.value
                        }))}
                        placeholder="Premium Catering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={homepageHero.description}
                        onChange={(e) => setHomepageHero(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Crafting exceptional culinary experiences..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Call-to-Action Buttons</h4>

                    <div className="space-y-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Primary Button</Label>
                          <Switch
                            checked={homepageHero.primaryButton.enabled}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              primaryButton: { ...prev.primaryButton, enabled: checked }
                            }))}
                          />
                        </div>
                        {homepageHero.primaryButton.enabled && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Button Text</Label>
                              <Input
                                value={homepageHero.primaryButton.text}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  primaryButton: { ...prev.primaryButton, text: e.target.value }
                                }))}
                                placeholder="Explore Our Menu"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Button Link</Label>
                              <Input
                                value={homepageHero.primaryButton.link}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  primaryButton: { ...prev.primaryButton, link: e.target.value }
                                }))}
                                placeholder="/menu"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Secondary Button</Label>
                          <Switch
                            checked={homepageHero.secondaryButton.enabled}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              secondaryButton: { ...prev.secondaryButton, enabled: checked }
                            }))}
                          />
                        </div>
                        {homepageHero.secondaryButton.enabled && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Button Text</Label>
                              <Input
                                value={homepageHero.secondaryButton.text}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  secondaryButton: { ...prev.secondaryButton, text: e.target.value }
                                }))}
                                placeholder="Get Custom Quote"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Button Link</Label>
                              <Input
                                value={homepageHero.secondaryButton.link}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  secondaryButton: { ...prev.secondaryButton, link: e.target.value }
                                }))}
                                placeholder="/contact"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Background Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold">Image Mode</h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {homepageHero.backgroundImages.length === 1
                        ? 'Single image mode - displays as static banner'
                        : 'Multiple images mode - displays as carousel'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={homepageHero.isCarousel}
                      onCheckedChange={(checked) => setHomepageHero(prev => ({
                        ...prev,
                        isCarousel: checked
                      }))}
                    />
                    <Label>Carousel Mode</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h4 className="text-base sm:text-lg font-semibold">Background Images</h4>
                    <Button onClick={addImage} size="sm" variant="outline" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {homepageHero.backgroundImages.map((image, index) => (
                      <div key={image.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Image {image.order}</h5>
                          <div className="flex items-center gap-2">
                            {index > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateImageOrder(image.id, 'up')}
                              >
                                ↑
                              </Button>
                            )}
                            {index < homepageHero.backgroundImages.length - 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateImageOrder(image.id, 'down')}
                              >
                                ↓
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeImage(image.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                Desktop Image URL
                              </Label>
                              <Input
                                value={image.desktop}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  backgroundImages: prev.backgroundImages.map(img =>
                                    img.id === image.id ? { ...img, desktop: e.target.value } : img
                                  )
                                }))}
                                placeholder="/images/hero-desktop.jpg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                Mobile Image URL
                              </Label>
                              <Input
                                value={image.mobile}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  backgroundImages: prev.backgroundImages.map(img =>
                                    img.id === image.id ? { ...img, mobile: e.target.value } : img
                                  )
                                }))}
                                placeholder="/images/hero-mobile.jpg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Alt Text</Label>
                              <Input
                                value={image.alt}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  backgroundImages: prev.backgroundImages.map(img =>
                                    img.id === image.id ? { ...img, alt: e.target.value } : img
                                  )
                                }))}
                                placeholder="Premium catering service"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label>Image Preview</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">Desktop</p>
                                <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded border flex items-center justify-center">
                                  {image.desktop ? (
                                    <img
                                      src={image.desktop}
                                      alt={image.alt}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-400">
                                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                                      <p className="text-xs">No image</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">Mobile</p>
                                <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded border flex items-center justify-center">
                                  {image.mobile ? (
                                    <img
                                      src={image.mobile}
                                      alt={image.alt}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-400">
                                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                                      <p className="text-xs">No image</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Settings */}
                {homepageHero.isCarousel && homepageHero.backgroundImages.length > 1 && (
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold">Carousel Settings</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Autoplay</Label>
                          <Switch
                            checked={homepageHero.carouselSettings.autoplay}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              carouselSettings: { ...prev.carouselSettings, autoplay: checked }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Autoplay Delay (seconds)</Label>
                          <Input
                            type="number"
                            value={homepageHero.carouselSettings.autoplayDelay / 1000}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              carouselSettings: {
                                ...prev.carouselSettings,
                                autoplayDelay: parseInt(e.target.value) * 1000
                              }
                            }))}
                            min="1"
                            max="30"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Show Indicators</Label>
                          <Switch
                            checked={homepageHero.carouselSettings.showIndicators}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              carouselSettings: { ...prev.carouselSettings, showIndicators: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Arrows</Label>
                          <Switch
                            checked={homepageHero.carouselSettings.showArrows}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              carouselSettings: { ...prev.carouselSettings, showArrows: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="w-5 h-5" />
                  Feature Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h4 className="text-base sm:text-lg font-semibold">Feature Badges</h4>
                  <Button onClick={addFeatureBadge} size="sm" variant="outline" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Badge
                  </Button>
                </div>

                <div className="space-y-4">
                  {homepageHero.featureBadges.map((badge) => (
                    <div key={badge.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Feature Badge</h5>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={badge.enabled}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              featureBadges: prev.featureBadges.map(b =>
                                b.id === badge.id ? { ...b, enabled: checked } : b
                              )
                            }))}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFeatureBadge(badge.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {badge.enabled && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Badge Text</Label>
                              <Input
                                value={badge.text}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  featureBadges: prev.featureBadges.map(b =>
                                    b.id === badge.id ? { ...b, text: e.target.value } : b
                                  )
                                }))}
                                placeholder="Prepared fresh after order"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <Input
                                value={badge.icon}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  featureBadges: prev.featureBadges.map(b =>
                                    b.id === badge.id ? { ...b, icon: e.target.value } : b
                                  )
                                }))}
                                placeholder="🍃"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Color</Label>
                              <Select
                                value={badge.color}
                                onValueChange={(value) => setHomepageHero(prev => ({
                                  ...prev,
                                  featureBadges: prev.featureBadges.map(b =>
                                    b.id === badge.id ? { ...b, color: value } : b
                                  )
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="green">Green</SelectItem>
                                  <SelectItem value="purple">Purple</SelectItem>
                                  <SelectItem value="blue">Blue</SelectItem>
                                  <SelectItem value="red">Red</SelectItem>
                                  <SelectItem value="yellow">Yellow</SelectItem>
                                  <SelectItem value="gray">Gray</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Preview</Label>
                              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getBadgeColorClass(badge.color)}`}>
                                  <span>{badge.icon}</span>
                                  <span>{badge.text || 'Badge text'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Featured Section Tab */}
        {activeTab === 'featured' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Featured Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Featured Section Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage the featured menu section text and visibility</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={homepageHero.featuredSection.enabled}
                    onCheckedChange={(checked) => setHomepageHero(prev => ({
                      ...prev,
                      featuredSection: { ...prev.featuredSection, enabled: checked }
                    }))}
                  />
                  <Label>Enable Featured Section</Label>
                </div>
              </div>

              {homepageHero.featuredSection.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold">Section Text</h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Badge Text</Label>
                          <Input
                            value={homepageHero.featuredSection.badgeText}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              featuredSection: { ...prev.featuredSection, badgeText: e.target.value }
                            }))}
                            placeholder="Featured Today"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Small badge text that appears above the section title
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={homepageHero.featuredSection.sectionTitle}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              featuredSection: { ...prev.featuredSection, sectionTitle: e.target.value }
                            }))}
                            placeholder="Featured Menu of the Day"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Main section heading for the featured menu
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold">Preview</h5>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                              {homepageHero.featuredSection.badgeText || 'Featured Today'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {homepageHero.featuredSection.sectionTitle || 'Featured Menu of the Day'}
                          </h3>
                          <div className="w-16 h-0.5 bg-gold-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold">Section Information</h5>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                          <Star className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="space-y-2">
                          <h6 className="font-medium text-blue-900 dark:text-blue-100">Featured Section</h6>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            This section controls the text displayed in your homepage's featured menu area.
                            The badge text appears as a small label above the main section title.
                          </p>
                          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            <li>• Badge text: Small label above the title</li>
                            <li>• Section title: Main heading for the featured menu</li>
                            <li>• Both texts are fully customizable</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Explore Menu Tab */}
        {activeTab === 'explore' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Explore Menu Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Explore Menu Section Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage the explore menu section text and button</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={homepageHero.exploreMenuSection.enabled}
                    onCheckedChange={(checked) => setHomepageHero(prev => ({
                      ...prev,
                      exploreMenuSection: { ...prev.exploreMenuSection, enabled: checked }
                    }))}
                  />
                  <Label>Enable Explore Menu Section</Label>
                </div>
              </div>

              {homepageHero.exploreMenuSection.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold">Section Content</h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Badge Text</Label>
                          <Input
                            value={homepageHero.exploreMenuSection.badgeText}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              exploreMenuSection: { ...prev.exploreMenuSection, badgeText: e.target.value }
                            }))}
                            placeholder="Explore Menu"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Small badge text that appears above the section title
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={homepageHero.exploreMenuSection.sectionTitle}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              exploreMenuSection: { ...prev.exploreMenuSection, sectionTitle: e.target.value }
                            }))}
                            placeholder="Explore Our Menu"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Main section heading for the explore menu area
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={homepageHero.exploreMenuSection.buttonText}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              exploreMenuSection: { ...prev.exploreMenuSection, buttonText: e.target.value }
                            }))}
                            placeholder="View Full Menu"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Text displayed on the call-to-action button
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            value={homepageHero.exploreMenuSection.buttonLink}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              exploreMenuSection: { ...prev.exploreMenuSection, buttonLink: e.target.value }
                            }))}
                            placeholder="/menu"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            URL where the button should link to
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold">Preview</h5>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                                {homepageHero.exploreMenuSection.badgeText || 'Explore Menu'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {homepageHero.exploreMenuSection.sectionTitle || 'Explore Our Menu'}
                            </h3>
                            <div className="w-16 h-0.5 bg-gold-500 rounded"></div>
                          </div>
                          <div className="mt-4">
                            <button className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                              {homepageHero.exploreMenuSection.buttonText || 'View Full Menu'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold">Section Information</h5>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                          <Home className="w-4 h-4 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="space-y-2">
                          <h6 className="font-medium text-green-900 dark:text-green-100">Explore Menu Section</h6>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            This section controls the "Explore Our Menu" area on your homepage.
                            It includes a badge text, section title, and a call-to-action button that directs users to your full menu.
                          </p>
                          <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                            <li>• Badge text: Small label above the section title</li>
                            <li>• Section title: Main heading for the menu exploration area</li>
                            <li>• Button text: Call-to-action button label</li>
                            <li>• Button link: URL destination for the button</li>
                            <li>• All elements are fully customizable</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Events We Cater Tab */}
        {activeTab === 'events' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Events We Cater
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Events Section Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage the events we cater section and event types</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={homepageHero.eventsSection.enabled}
                    onCheckedChange={(checked) => setHomepageHero(prev => ({
                      ...prev,
                      eventsSection: { ...prev.eventsSection, enabled: checked }
                    }))}
                  />
                  <Label>Enable Events Section</Label>
                </div>
              </div>

              {homepageHero.eventsSection.enabled && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="space-y-4">
                    <h5 className="font-semibold">Section Header</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Badge Text</Label>
                          <Input
                            value={homepageHero.eventsSection.badgeText}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              eventsSection: { ...prev.eventsSection, badgeText: e.target.value }
                            }))}
                            placeholder="Premium Events"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={homepageHero.eventsSection.sectionTitle}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              eventsSection: { ...prev.eventsSection, sectionTitle: e.target.value }
                            }))}
                            placeholder="Events We Cater"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={homepageHero.eventsSection.description}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              eventsSection: { ...prev.eventsSection, description: e.target.value }
                            }))}
                            placeholder="From intimate gatherings to grand celebrations..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Background Settings */}
                      <div className="space-y-4">
                        <h5 className="font-semibold">Background Settings</h5>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Background Type</Label>
                            <Select
                              value={homepageHero.eventsSection.background.type}
                              onValueChange={(value: 'color' | 'image') => setHomepageHero(prev => ({
                                ...prev,
                                eventsSection: {
                                  ...prev.eventsSection,
                                  background: { ...prev.eventsSection.background, type: value }
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="color">Solid Color</SelectItem>
                                <SelectItem value="image">Background Image</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {homepageHero.eventsSection.background.type === 'color' && (
                            <div className="space-y-2">
                              <Label>Background Color</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  value={homepageHero.eventsSection.background.color}
                                  onChange={(e) => setHomepageHero(prev => ({
                                    ...prev,
                                    eventsSection: {
                                      ...prev.eventsSection,
                                      background: { ...prev.eventsSection.background, color: e.target.value }
                                    }
                                  }))}
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  value={homepageHero.eventsSection.background.color}
                                  onChange={(e) => setHomepageHero(prev => ({
                                    ...prev,
                                    eventsSection: {
                                      ...prev.eventsSection,
                                      background: { ...prev.eventsSection.background, color: e.target.value }
                                    }
                                  }))}
                                  placeholder="#f8fafc"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          )}

                          {homepageHero.eventsSection.background.type === 'image' && (
                            <div className="space-y-2">
                              <Label>Background Image</Label>
                              <div className="space-y-2">
                                <Input
                                  value={homepageHero.eventsSection.background.image}
                                  onChange={(e) => setHomepageHero(prev => ({
                                    ...prev,
                                    eventsSection: {
                                      ...prev.eventsSection,
                                      background: { ...prev.eventsSection.background, image: e.target.value }
                                    }
                                  }))}
                                  placeholder="/images/events-bg.jpg"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newImageUrl = prompt('Enter image URL:');
                                    if (newImageUrl) {
                                      setHomepageHero(prev => ({
                                        ...prev,
                                        eventsSection: {
                                          ...prev.eventsSection,
                                          background: { ...prev.eventsSection.background, image: newImageUrl }
                                        }
                                      }));
                                    }
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Image
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Background Opacity</Label>
                            <div className="space-y-2">
                              <Input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={homepageHero.eventsSection.background.opacity}
                                onChange={(e) => setHomepageHero(prev => ({
                                  ...prev,
                                  eventsSection: {
                                    ...prev.eventsSection,
                                    background: { ...prev.eventsSection.background, opacity: parseFloat(e.target.value) }
                                  }
                                }))}
                              />
                              <p className="text-sm text-slate-500">
                                Opacity: {Math.round(homepageHero.eventsSection.background.opacity * 100)}%
                              </p>
                            </div>
                          </div>

                          {/* Background Preview */}
                          <div className="space-y-2">
                            <Label>Background Preview</Label>
                            <div
                              className="w-full h-32 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden"
                              style={{
                                backgroundColor: homepageHero.eventsSection.background.type === 'color'
                                  ? homepageHero.eventsSection.background.color
                                  : 'transparent',
                                backgroundImage: homepageHero.eventsSection.background.type === 'image'
                                  ? `url(${homepageHero.eventsSection.background.image})`
                                  : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: homepageHero.eventsSection.background.opacity
                              }}
                            >
                              <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                <p className="text-white font-medium">Events We Cater Background</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h6 className="font-medium">Preview</h6>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                                {homepageHero.eventsSection.badgeText || 'Premium Events'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {homepageHero.eventsSection.sectionTitle || 'Events We Cater'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {homepageHero.eventsSection.description || 'From intimate gatherings to grand celebrations...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Types */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">Event Types</h5>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event Type
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {homepageHero.eventsSection.eventTypes.map((eventType, index) => (
                        <div key={eventType.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium">Event Type {index + 1}</h6>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={eventType.enabled}
                                onCheckedChange={(checked) => setHomepageHero(prev => ({
                                  ...prev,
                                  eventsSection: {
                                    ...prev.eventsSection,
                                    eventTypes: prev.eventsSection.eventTypes.map(et =>
                                      et.id === eventType.id ? { ...et, enabled: checked } : et
                                    )
                                  }
                                }))}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setHomepageHero(prev => ({
                                  ...prev,
                                  eventsSection: {
                                    ...prev.eventsSection,
                                    eventTypes: prev.eventsSection.eventTypes.filter(et => et.id !== eventType.id)
                                  }
                                }))}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {eventType.enabled && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Event Title</Label>
                                  <Input
                                    value={eventType.title}
                                    onChange={(e) => setHomepageHero(prev => ({
                                      ...prev,
                                      eventsSection: {
                                        ...prev.eventsSection,
                                        eventTypes: prev.eventsSection.eventTypes.map(et =>
                                          et.id === eventType.id ? { ...et, title: e.target.value } : et
                                        )
                                      }
                                    }))}
                                    placeholder="Wedding Catering"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Event Image</Label>
                                  <div className="space-y-2">
                                    <Input
                                      value={eventType.image}
                                      onChange={(e) => setHomepageHero(prev => ({
                                        ...prev,
                                        eventsSection: {
                                          ...prev.eventsSection,
                                          eventTypes: prev.eventsSection.eventTypes.map(et =>
                                            et.id === eventType.id ? { ...et, image: e.target.value } : et
                                          )
                                        }
                                      }))}
                                      placeholder="/images/wedding-catering.jpg"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          // In a real app, this would open a file picker
                                          const newImageUrl = prompt('Enter image URL:');
                                          if (newImageUrl) {
                                            setHomepageHero(prev => ({
                                              ...prev,
                                              eventsSection: {
                                                ...prev.eventsSection,
                                                eventTypes: prev.eventsSection.eventTypes.map(et =>
                                                  et.id === eventType.id ? { ...et, image: newImageUrl } : et
                                                )
                                              }
                                            }));
                                          }
                                        }}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Image
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={eventType.description}
                                    onChange={(e) => setHomepageHero(prev => ({
                                      ...prev,
                                      eventsSection: {
                                        ...prev.eventsSection,
                                        eventTypes: prev.eventsSection.eventTypes.map(et =>
                                          et.id === eventType.id ? { ...et, description: e.target.value } : et
                                        )
                                      }
                                    }))}
                                    placeholder="Make your special day unforgettable..."
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Button Text</Label>
                                    <Input
                                      value={eventType.buttonText}
                                      onChange={(e) => setHomepageHero(prev => ({
                                        ...prev,
                                        eventsSection: {
                                          ...prev.eventsSection,
                                          eventTypes: prev.eventsSection.eventTypes.map(et =>
                                            et.id === eventType.id ? { ...et, buttonText: e.target.value } : et
                                          )
                                        }
                                      }))}
                                      placeholder="Contact Us"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Button Link</Label>
                                    <Input
                                      value={eventType.buttonLink}
                                      onChange={(e) => setHomepageHero(prev => ({
                                        ...prev,
                                        eventsSection: {
                                          ...prev.eventsSection,
                                          eventTypes: prev.eventsSection.eventTypes.map(et =>
                                            et.id === eventType.id ? { ...et, buttonLink: e.target.value } : et
                                          )
                                        }
                                      }))}
                                      placeholder="/contact"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Image Preview</Label>
                                  <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg border flex items-center justify-center overflow-hidden">
                                    {eventType.image ? (
                                      <img
                                        src={eventType.image}
                                        alt={eventType.title}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (nextElement) {
                                            nextElement.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <div className={`${eventType.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-slate-400`}>
                                      <div className="text-center">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">No image uploaded</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Services List</Label>
                                  <div className="space-y-2">
                                    {eventType.services.map((service, serviceIndex) => (
                                      <div key={serviceIndex} className="flex items-center gap-2">
                                        <Input
                                          value={service}
                                          onChange={(e) => {
                                            const newServices = [...eventType.services];
                                            newServices[serviceIndex] = e.target.value;
                                            setHomepageHero(prev => ({
                                              ...prev,
                                              eventsSection: {
                                                ...prev.eventsSection,
                                                eventTypes: prev.eventsSection.eventTypes.map(et =>
                                                  et.id === eventType.id ? { ...et, services: newServices } : et
                                                )
                                              }
                                            }));
                                          }}
                                          placeholder="Service name"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const newServices = eventType.services.filter((_, i) => i !== serviceIndex);
                                            setHomepageHero(prev => ({
                                              ...prev,
                                              eventsSection: {
                                                ...prev.eventsSection,
                                                eventTypes: prev.eventsSection.eventTypes.map(et =>
                                                  et.id === eventType.id ? { ...et, services: newServices } : et
                                                )
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
                                        const newServices = [...eventType.services, ''];
                                        setHomepageHero(prev => ({
                                          ...prev,
                                          eventsSection: {
                                            ...prev.eventsSection,
                                            eventTypes: prev.eventsSection.eventTypes.map(et =>
                                              et.id === eventType.id ? { ...et, services: newServices } : et
                                            )
                                          }
                                        }));
                                      }}
                                      className="w-full"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Service
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Stories Tab */}
        {activeTab === 'testimonials' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Customer Stories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Testimonials Section Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage customer testimonials and reviews</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={homepageHero.testimonialsSection.enabled}
                    onCheckedChange={(checked) => setHomepageHero(prev => ({
                      ...prev,
                      testimonialsSection: { ...prev.testimonialsSection, enabled: checked }
                    }))}
                  />
                  <Label>Enable Section</Label>
                </div>
              </div>

              {homepageHero.testimonialsSection.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Badge Text</Label>
                        <Input
                          value={homepageHero.testimonialsSection.badgeText}
                          onChange={(e) => setHomepageHero(prev => ({
                            ...prev,
                            testimonialsSection: { ...prev.testimonialsSection, badgeText: e.target.value }
                          }))}
                          placeholder="Customer Stories"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={homepageHero.testimonialsSection.sectionTitle}
                          onChange={(e) => setHomepageHero(prev => ({
                            ...prev,
                            testimonialsSection: { ...prev.testimonialsSection, sectionTitle: e.target.value }
                          }))}
                          placeholder="What Our Clients Say"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={homepageHero.testimonialsSection.description}
                        onChange={(e) => setHomepageHero(prev => ({
                          ...prev,
                          testimonialsSection: { ...prev.testimonialsSection, description: e.target.value }
                        }))}
                        placeholder="Hear from our satisfied customers..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">Customer Testimonials</h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newTestimonial = {
                            id: (homepageHero.testimonialsSection.testimonials.length + 1).toString(),
                            name: '',
                            eventType: '',
                            quote: '',
                            rating: 5,
                            enabled: true
                          };
                          setHomepageHero(prev => ({
                            ...prev,
                            testimonialsSection: {
                              ...prev.testimonialsSection,
                              testimonials: [...prev.testimonialsSection.testimonials, newTestimonial]
                            }
                          }));
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Testimonial
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {homepageHero.testimonialsSection.testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium">Testimonial {index + 1}</h6>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={testimonial.enabled}
                                onCheckedChange={(checked) => setHomepageHero(prev => ({
                                  ...prev,
                                  testimonialsSection: {
                                    ...prev.testimonialsSection,
                                    testimonials: prev.testimonialsSection.testimonials.map(t =>
                                      t.id === testimonial.id ? { ...t, enabled: checked } : t
                                    )
                                  }
                                }))}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setHomepageHero(prev => ({
                                  ...prev,
                                  testimonialsSection: {
                                    ...prev.testimonialsSection,
                                    testimonials: prev.testimonialsSection.testimonials.filter(t => t.id !== testimonial.id)
                                  }
                                }))}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {testimonial.enabled && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Customer Name</Label>
                                  <Input
                                    value={testimonial.name}
                                    onChange={(e) => setHomepageHero(prev => ({
                                      ...prev,
                                      testimonialsSection: {
                                        ...prev.testimonialsSection,
                                        testimonials: prev.testimonialsSection.testimonials.map(t =>
                                          t.id === testimonial.id ? { ...t, name: e.target.value } : t
                                        )
                                      }
                                    }))}
                                    placeholder="Priya Sharma"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Event Type</Label>
                                  <Input
                                    value={testimonial.eventType}
                                    onChange={(e) => setHomepageHero(prev => ({
                                      ...prev,
                                      testimonialsSection: {
                                        ...prev.testimonialsSection,
                                        testimonials: prev.testimonialsSection.testimonials.map(t =>
                                          t.id === testimonial.id ? { ...t, eventType: e.target.value } : t
                                        )
                                      }
                                    }))}
                                    placeholder="Wedding Reception"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Rating</Label>
                                  <Select
                                    value={testimonial.rating.toString()}
                                    onValueChange={(value) => setHomepageHero(prev => ({
                                      ...prev,
                                      testimonialsSection: {
                                        ...prev.testimonialsSection,
                                        testimonials: prev.testimonialsSection.testimonials.map(t =>
                                          t.id === testimonial.id ? { ...t, rating: parseInt(value) } : t
                                        )
                                      }
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 Star</SelectItem>
                                      <SelectItem value="2">2 Stars</SelectItem>
                                      <SelectItem value="3">3 Stars</SelectItem>
                                      <SelectItem value="4">4 Stars</SelectItem>
                                      <SelectItem value="5">5 Stars</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Customer Quote</Label>
                                <Textarea
                                  value={testimonial.quote}
                                  onChange={(e) => setHomepageHero(prev => ({
                                    ...prev,
                                    testimonialsSection: {
                                      ...prev.testimonialsSection,
                                      testimonials: prev.testimonialsSection.testimonials.map(t =>
                                        t.id === testimonial.id ? { ...t, quote: e.target.value } : t
                                      )
                                    }
                                  }))}
                                  placeholder="Outstanding catering service! The food was delicious..."
                                  rows={4}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-3">
                    <h6 className="font-medium">Preview</h6>
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="space-y-4">
                        <div className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                            {homepageHero.testimonialsSection.badgeText || 'Customer Stories'}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                            {homepageHero.testimonialsSection.sectionTitle || 'What Our Clients Say'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {homepageHero.testimonialsSection.description || 'Hear from our satisfied customers...'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {homepageHero.testimonialsSection.testimonials.filter(t => t.enabled).slice(0, 3).map((testimonial) => (
                            <div key={testimonial.id} className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                              <div className="space-y-3">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                                  ))}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                  "{testimonial.quote || 'Customer testimonial...'}"
                                </p>
                                <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {testimonial.name || 'Customer Name'}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {testimonial.eventType || 'Event Type'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to Action Tab */}
        {activeTab === 'cta' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Call to Action Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">CTA Section Settings</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage the final call-to-action section</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={homepageHero.ctaSection.enabled}
                    onCheckedChange={(checked) => setHomepageHero(prev => ({
                      ...prev,
                      ctaSection: { ...prev.ctaSection, enabled: checked }
                    }))}
                  />
                  <Label>Enable Section</Label>
                </div>
              </div>

              {homepageHero.ctaSection.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                          value={homepageHero.ctaSection.headline}
                          onChange={(e) => setHomepageHero(prev => ({
                            ...prev,
                            ctaSection: { ...prev.ctaSection, headline: e.target.value }
                          }))}
                          placeholder="Ready to Create Magic?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={homepageHero.ctaSection.description}
                          onChange={(e) => setHomepageHero(prev => ({
                            ...prev,
                            ctaSection: { ...prev.ctaSection, description: e.target.value }
                          }))}
                          placeholder="Let us transform your event into an unforgettable culinary experience..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Type</Label>
                        <Select
                          value={homepageHero.ctaSection.background.type}
                          onValueChange={(value: 'color' | 'gradient') => setHomepageHero(prev => ({
                            ...prev,
                            ctaSection: {
                              ...prev.ctaSection,
                              background: { ...prev.ctaSection.background, type: value }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Solid Color</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {homepageHero.ctaSection.background.type === 'color' && (
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={homepageHero.ctaSection.background.color}
                              onChange={(e) => setHomepageHero(prev => ({
                                ...prev,
                                ctaSection: {
                                  ...prev.ctaSection,
                                  background: { ...prev.ctaSection.background, color: e.target.value }
                                }
                              }))}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={homepageHero.ctaSection.background.color}
                              onChange={(e) => setHomepageHero(prev => ({
                                ...prev,
                                ctaSection: {
                                  ...prev.ctaSection,
                                  background: { ...prev.ctaSection.background, color: e.target.value }
                                }
                              }))}
                              placeholder="#f97316"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {homepageHero.ctaSection.background.type === 'gradient' && (
                        <div className="space-y-2">
                          <Label>Gradient CSS</Label>
                          <Input
                            value={homepageHero.ctaSection.background.gradient}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                background: { ...prev.ctaSection.background, gradient: e.target.value }
                              }
                            }))}
                            placeholder="linear-gradient(135deg, #fbbf24 0%, #f97316 100%)"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold">Action Buttons</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Primary Button Text</Label>
                          <Input
                            value={homepageHero.ctaSection.primaryButton.text}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                primaryButton: { ...prev.ctaSection.primaryButton, text: e.target.value }
                              }
                            }))}
                            placeholder="Start Planning"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Button Link</Label>
                          <Input
                            value={homepageHero.ctaSection.primaryButton.link}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                primaryButton: { ...prev.ctaSection.primaryButton, link: e.target.value }
                              }
                            }))}
                            placeholder="/contact"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={homepageHero.ctaSection.primaryButton.enabled}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                primaryButton: { ...prev.ctaSection.primaryButton, enabled: checked }
                              }
                            }))}
                          />
                          <Label>Enable Primary Button</Label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Secondary Button Text</Label>
                          <Input
                            value={homepageHero.ctaSection.secondaryButton.text}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                secondaryButton: { ...prev.ctaSection.secondaryButton, text: e.target.value }
                              }
                            }))}
                            placeholder="View Full Menu"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Button Link</Label>
                          <Input
                            value={homepageHero.ctaSection.secondaryButton.link}
                            onChange={(e) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                secondaryButton: { ...prev.ctaSection.secondaryButton, link: e.target.value }
                              }
                            }))}
                            placeholder="/menu"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={homepageHero.ctaSection.secondaryButton.enabled}
                            onCheckedChange={(checked) => setHomepageHero(prev => ({
                              ...prev,
                              ctaSection: {
                                ...prev.ctaSection,
                                secondaryButton: { ...prev.ctaSection.secondaryButton, enabled: checked }
                              }
                            }))}
                          />
                          <Label>Enable Secondary Button</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-3">
                    <h6 className="font-medium">Preview</h6>
                    <div
                      className="p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center"
                      style={{
                        background: homepageHero.ctaSection.background.type === 'gradient'
                          ? homepageHero.ctaSection.background.gradient
                          : homepageHero.ctaSection.background.color
                      }}
                    >
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">
                          {homepageHero.ctaSection.headline || 'Ready to Create Magic?'}
                        </h2>
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                          {homepageHero.ctaSection.description || 'Let us transform your event into an unforgettable culinary experience...'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          {homepageHero.ctaSection.primaryButton.enabled && (
                            <Button
                              className="bg-white text-orange-600 hover:bg-gray-50 border border-orange-200"
                              size="lg"
                            >
                              {homepageHero.ctaSection.primaryButton.text || 'Start Planning'}
                            </Button>
                          )}
                          {homepageHero.ctaSection.secondaryButton.enabled && (
                            <Button
                              variant="outline"
                              className="bg-orange-600 text-white border-orange-500 hover:bg-orange-700"
                              size="lg"
                            >
                              {homepageHero.ctaSection.secondaryButton.text || 'View Full Menu'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Overlay Settings</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable Overlay</Label>
                      <Switch
                        checked={homepageHero.overlay.enabled}
                        onCheckedChange={(checked) => setHomepageHero(prev => ({
                          ...prev,
                          overlay: { ...prev.overlay, enabled: checked }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Overlay Opacity</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={homepageHero.overlay.opacity}
                        onChange={(e) => setHomepageHero(prev => ({
                          ...prev,
                          overlay: { ...prev.overlay, opacity: parseFloat(e.target.value) }
                        }))}
                      />
                      <p className="text-sm text-slate-500">
                        Opacity: {Math.round(homepageHero.overlay.opacity * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Overlay Color</Label>
                      <Select
                        value={homepageHero.overlay.color}
                        onValueChange={(value) => setHomepageHero(prev => ({
                          ...prev,
                          overlay: { ...prev.overlay, color: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Overlay Preview</Label>
                      <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                        <div
                          className={`absolute inset-0 ${homepageHero.overlay.color === 'black' ? 'bg-black' :
                              homepageHero.overlay.color === 'white' ? 'bg-white' :
                                homepageHero.overlay.color === 'gray' ? 'bg-gray-500' :
                                  homepageHero.overlay.color === 'blue' ? 'bg-blue-500' :
                                    'bg-purple-500'
                            }`}
                          style={{ opacity: homepageHero.overlay.opacity }}
                        />
                        <div className="relative z-10 flex items-center justify-center h-full text-white font-semibold">
                          Content
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
