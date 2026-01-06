import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Star, 
  Menu, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Trash2
} from 'lucide-react';
import { 
  Event, 
  Testimonial
} from '@/types/cms';
import { useHomepageStore } from '@/store/homepage-store';

export default function HomepageManager() {
  const [activeTab, setActiveTab] = useState('hero');

  // Get data from store with error handling
  let store;
  try {
    store = useHomepageStore();
    console.log('Store loaded successfully:', store);
  } catch (error) {
    console.error('Error with store:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error Loading Homepage Manager</h3>
        <p className="text-red-600">There was an issue loading the homepage management system.</p>
        <p className="text-sm text-red-500 mt-2">Error: {String(error)}</p>
      </div>
    );
  }

  const {
    heroSection,
    featuredMenuSection,
    exploreMenuSection,
    events,
    testimonials,
    footerSection,
    readyToCreateSection,
    updateHeroSection,
    updateFeaturedMenuSection,
    updateExploreMenuSection,
    addEvent,
    deleteEvent,
    addTestimonial,
    deleteTestimonial,
    updateFooterSection,
    updateReadyToCreateSection,
  } = store;


  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({});

  const handleSaveHero = () => {
    updateHeroSection(heroSection);
    setIsEditing(null);
  };

  const handleSaveFeaturedMenu = () => {
    updateFeaturedMenuSection(featuredMenuSection);
    setIsEditing(null);
  };

  const handleSaveExploreMenu = () => {
    updateExploreMenuSection(exploreMenuSection);
    setIsEditing(null);
  };

  const handleSaveFooter = () => {
    updateFooterSection(footerSection);
    setIsEditing(null);
  };

  const handleSaveReadyToCreate = () => {
    updateReadyToCreateSection(readyToCreateSection);
    setIsEditing(null);
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.description) {
      addEvent({
        title: newEvent.title!,
        description: newEvent.description!,
        image_url: newEvent.image_url || '',
        date: newEvent.date || '',
        location: newEvent.location || '',
        price: newEvent.price || null,
        is_active: true,
        display_order: events.length + 1,
      });
      setNewEvent({});
    }
  };

  const handleAddTestimonial = () => {
    if (newTestimonial.client_name && newTestimonial.content) {
      addTestimonial({
        client_name: newTestimonial.client_name!,
        client_title: newTestimonial.client_title || '',
        client_company: newTestimonial.client_company || null,
        client_image_url: newTestimonial.client_image_url || null,
        content: newTestimonial.content!,
        rating: newTestimonial.rating || 5,
        is_active: true,
        display_order: testimonials.length + 1,
      });
      setNewTestimonial({});
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };

  const handleDeleteTestimonial = (id: string) => {
    deleteTestimonial(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Homepage Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage all sections of your homepage content
        </p>
        <p className="text-sm text-green-600 mt-2">✅ HomepageManager component is rendering!</p>
        <p className="text-sm text-blue-600">Active tab: {activeTab}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Featured Menu
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            Explore Menu
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events We Cater
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="ready-to-create" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Ready to Create
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Main Title</Label>
                  <Input
                    id="hero-title"
                    value={heroSection.title}
                    onChange={(e) => updateHeroSection({ title: e.target.value })}
                    placeholder="Welcome to SR FoodKraft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    value={heroSection.subtitle}
                    onChange={(e) => updateHeroSection({ subtitle: e.target.value })}
                    placeholder="Crafting exceptional culinary experiences..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-bg-image">Background Image URL</Label>
                <Input
                  id="hero-bg-image"
                  value={heroSection.background_image_url}
                    onChange={(e) => updateHeroSection({ background_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-btn-text">Primary Button Text</Label>
                  <Input
                    id="primary-btn-text"
                    value={heroSection.primary_button_text}
                    onChange={(e) => updateHeroSection({ primary_button_text: e.target.value })}
                    placeholder="Explore Our Menu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-btn-url">Primary Button URL</Label>
                  <Input
                    id="primary-btn-url"
                    value={heroSection.primary_button_url}
                    onChange={(e) => updateHeroSection({ primary_button_url: e.target.value })}
                    placeholder="/menu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-text">Secondary Button Text</Label>
                  <Input
                    id="secondary-btn-text"
                    value={heroSection.secondary_button_text}
                    onChange={(e) => updateHeroSection({ secondary_button_text: e.target.value })}
                    placeholder="Get Custom Quote"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-url">Secondary Button URL</Label>
                  <Input
                    id="secondary-btn-url"
                    value={heroSection.secondary_button_url}
                    onChange={(e) => updateHeroSection({ secondary_button_url: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveHero} className="bg-gold-500 hover:bg-gold-600">
                  Save Hero Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Menu Section */}
        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Featured Menu Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featured-title">Section Title</Label>
                <Input
                  id="featured-title"
                  value={featuredMenuSection.title}
                    onChange={(e) => updateFeaturedMenuSection({ title: e.target.value })}
                  placeholder="Featured Menu of the Day"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured-subtitle">Section Subtitle</Label>
                <Input
                  id="featured-subtitle"
                  value={featuredMenuSection.subtitle || ''}
                    onChange={(e) => updateFeaturedMenuSection({ subtitle: e.target.value })}
                  placeholder="Discover our chef's special selections"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveFeaturedMenu} className="bg-gold-500 hover:bg-gold-600">
                  Save Featured Menu Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore Menu Section */}
        <TabsContent value="explore">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Explore Menu Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="explore-title">Section Title</Label>
                <Input
                  id="explore-title"
                  value={exploreMenuSection.title}
                    onChange={(e) => updateExploreMenuSection({ title: e.target.value })}
                  placeholder="Explore Our Menu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explore-subtitle">Section Subtitle</Label>
                <Input
                  id="explore-subtitle"
                  value={exploreMenuSection.subtitle || ''}
                    onChange={(e) => updateExploreMenuSection({ subtitle: e.target.value })}
                  placeholder="From traditional favorites to modern innovations"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="explore-btn-text">Button Text</Label>
                  <Input
                    id="explore-btn-text"
                    value={exploreMenuSection.button_text}
                    onChange={(e) => updateExploreMenuSection({ button_text: e.target.value })}
                    placeholder="View Full Menu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explore-btn-url">Button URL</Label>
                  <Input
                    id="explore-btn-url"
                    value={exploreMenuSection.button_url}
                    onChange={(e) => updateExploreMenuSection({ button_url: e.target.value })}
                    placeholder="/menu"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveExploreMenu} className="bg-gold-500 hover:bg-gold-600">
                  Save Explore Menu Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Section */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events We Cater
                </div>
                <Button onClick={() => setIsEditing('new-event')} className="bg-gold-500 hover:bg-gold-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing === 'new-event' && (
                <Card className="border-gold-200 bg-gold-50 dark:bg-gold-900/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Event Title</Label>
                        <Input
                          value={newEvent.title || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Corporate Events"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.date || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newEvent.description || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Professional catering for your business meetings..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={newEvent.location || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Any Location"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          value={newEvent.price || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                          placeholder="Starting from ₹500 per person"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={newEvent.image_url || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEvent} className="bg-gold-500 hover:bg-gold-600">
                        Add Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span>📅 {event.date}</span>
                            <span>📍 {event.location}</span>
                            <span>💰 {event.price}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Section */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  What Our Clients Say
                </div>
                <Button onClick={() => setIsEditing('new-testimonial')} className="bg-gold-500 hover:bg-gold-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing === 'new-testimonial' && (
                <Card className="border-gold-200 bg-gold-50 dark:bg-gold-900/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Client Name</Label>
                        <Input
                          value={newTestimonial.client_name || ''}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })}
                          placeholder="Priya Sharma"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Title</Label>
                        <Input
                          value={newTestimonial.client_title || ''}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, client_title: e.target.value })}
                          placeholder="Event Manager"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={newTestimonial.client_company || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, client_company: e.target.value })}
                        placeholder="TechCorp India"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Testimonial Content</Label>
                      <Textarea
                        value={newTestimonial.content || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                        placeholder="SR FoodKraft made our event absolutely perfect..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rating (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={newTestimonial.rating || 5}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Image URL</Label>
                        <Input
                          value={newTestimonial.client_image_url || ''}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, client_image_url: e.target.value })}
                          placeholder="https://example.com/photo.jpg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTestimonial} className="bg-gold-500 hover:bg-gold-600">
                        Add Testimonial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {testimonial.client_image_url && (
                          <img
                            src={testimonial.client_image_url}
                            alt={testimonial.client_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{testimonial.client_name}</h3>
                            <div className="flex">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {testimonial.client_title}
                            {testimonial.client_company && ` at ${testimonial.client_company}`}
                          </p>
                          <p className="mt-2 text-slate-700 dark:text-slate-300">{testimonial.content}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ready to Create Magic Section */}
        <TabsContent value="ready-to-create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Ready to Create Magic Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ready-title">Main Title</Label>
                  <Input
                    id="ready-title"
                    value={readyToCreateSection.title}
                    onChange={(e) => updateReadyToCreateSection({ title: e.target.value })}
                    placeholder="Ready to Create Magic?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ready-subtitle">Subtitle</Label>
                  <Input
                    id="ready-subtitle"
                    value={readyToCreateSection.subtitle || ''}
                    onChange={(e) => updateReadyToCreateSection({ subtitle: e.target.value })}
                    placeholder="Let us bring your culinary vision to life"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ready-description">Description</Label>
                <Textarea
                  id="ready-description"
                  value={readyToCreateSection.description || ''}
                  onChange={(e) => updateReadyToCreateSection({ description: e.target.value })}
                  placeholder="From intimate gatherings to grand celebrations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ready-bg-image">Background Image URL</Label>
                <Input
                  id="ready-bg-image"
                  value={readyToCreateSection.background_image_url || ''}
                  onChange={(e) => updateReadyToCreateSection({ background_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ready-primary-btn-text">Primary Button Text</Label>
                  <Input
                    id="ready-primary-btn-text"
                    value={readyToCreateSection.primary_button_text}
                    onChange={(e) => updateReadyToCreateSection({ primary_button_text: e.target.value })}
                    placeholder="Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ready-primary-btn-url">Primary Button URL</Label>
                  <Input
                    id="ready-primary-btn-url"
                    value={readyToCreateSection.primary_button_url}
                    onChange={(e) => updateReadyToCreateSection({ primary_button_url: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ready-secondary-btn-text">Secondary Button Text</Label>
                  <Input
                    id="ready-secondary-btn-text"
                    value={readyToCreateSection.secondary_button_text || ''}
                    onChange={(e) => updateReadyToCreateSection({ secondary_button_text: e.target.value })}
                    placeholder="View Our Work"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ready-secondary-btn-url">Secondary Button URL</Label>
                  <Input
                    id="ready-secondary-btn-url"
                    value={readyToCreateSection.secondary_button_url || ''}
                    onChange={(e) => updateReadyToCreateSection({ secondary_button_url: e.target.value })}
                    placeholder="/gallery"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveReadyToCreate} className="bg-gold-500 hover:bg-gold-600">
                  Save Ready to Create Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Footer Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-company">Company Name</Label>
                  <Input
                    id="footer-company"
                    value={footerSection.company_name}
                    onChange={(e) => updateFooterSection({ company_name: e.target.value })}
                    placeholder="SR FoodKraft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-tagline">Tagline</Label>
                  <Input
                    id="footer-tagline"
                    value={footerSection.tagline || ''}
                    onChange={(e) => updateFooterSection({ tagline: e.target.value })}
                    placeholder="Crafting exceptional culinary experiences"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-description">Description</Label>
                <Textarea
                  id="footer-description"
                  value={footerSection.description || ''}
                    onChange={(e) => updateFooterSection({ description: e.target.value })}
                  placeholder="We specialize in creating memorable dining experiences..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-email">Contact Email</Label>
                  <Input
                    id="footer-email"
                    type="email"
                    value={footerSection.contact_email}
                    onChange={(e) => updateFooterSection({ contact_email: e.target.value })}
                    placeholder="info@srfoodkraft.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-phone">Contact Phone</Label>
                  <Input
                    id="footer-phone"
                    value={footerSection.contact_phone}
                    onChange={(e) => updateFooterSection({ contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-address">Address</Label>
                <Textarea
                  id="footer-address"
                  value={footerSection.address || ''}
                    onChange={(e) => updateFooterSection({ address: e.target.value })}
                  placeholder="123 Food Street, Culinary District, Mumbai, Maharashtra 400001"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-facebook">Facebook</Label>
                    <Input
                      id="footer-facebook"
                      value={footerSection.social_links.facebook || ''}
                      onChange={(e) => updateFooterSection({ 
                        social_links: { ...footerSection.social_links, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/srfoodkraft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-instagram">Instagram</Label>
                    <Input
                      id="footer-instagram"
                      value={footerSection.social_links.instagram || ''}
                      onChange={(e) => updateFooterSection({ 
                        social_links: { ...footerSection.social_links, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/srfoodkraft"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-copyright">Copyright Text</Label>
                <Input
                  id="footer-copyright"
                  value={footerSection.copyright_text}
                    onChange={(e) => updateFooterSection({ copyright_text: e.target.value })}
                  placeholder="© 2024 SR FoodKraft. All rights reserved."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveFooter} className="bg-gold-500 hover:bg-gold-600">
                  Save Footer Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
