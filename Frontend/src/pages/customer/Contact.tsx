import { useState, useEffect } from 'react';
import { useInquiryStore } from '@/store/inquiry-store';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { MapPin, Phone, Mail, Send, CheckCircle, Clock } from 'lucide-react';

export default function Contact() {
    const { addInquiry } = useInquiryStore();
    const { siteSettings, fetchSiteSettings } = useCMSEnhancedStore();

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
        eventType: '',
        eventDate: '',
        guestCount: ''
    });

    useEffect(() => {
        if (!siteSettings.length) {
            fetchSiteSettings();
        }
    }, [fetchSiteSettings, siteSettings.length]);

    // Helper to get setting value
    const getSetting = (key: string, defaultVal: string) => {
        const setting = siteSettings.find(s => s.key === key);
        return setting ? setting.value : defaultVal;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addInquiry({
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: 'new',
                priority: 'medium',
                additional_details: `Subject: ${formData.subject}\n\nMessage: ${formData.message}\n\nEvent Type: ${formData.eventType}\nEvent Date: ${formData.eventDate}\nGuest Count: ${formData.guestCount}`,
                event_type: formData.eventType as any || undefined,
                event_date: formData.eventDate || undefined,
                guest_count: formData.guestCount ? parseInt(formData.guestCount) : undefined
            });

            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: 'General Inquiry',
                message: '',
                eventType: '',
                eventDate: '',
                guestCount: ''
            });
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white uppercase tracking-wider mb-4">
                        {getSetting('contact_title', 'Get in Touch')}
                    </h1>
                    <div className="w-24 h-1 bg-[#F2A900] mx-auto mb-6"></div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {getSetting('contact_description', "Have a question, feedback, or want to place a bulk order? We'd love to hear from you. Fill out the form below or reach out to us directly.")}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-8 space-y-6 hover:border-[#F2A900]/60 transition-colors duration-300">
                            <h3 className="text-2xl font-bold text-white mb-2">Contact Information</h3>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-[#F2A900]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F2A900] transition-all duration-300">
                                    <MapPin className="w-6 h-6 text-[#F2A900] group-hover:text-black transition-colors" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-white leading-relaxed whitespace-pre-line">
                                        {getSetting('contact_address', 'Next Street to Ambur Court,\nNear Old State Bank,\nKaka Chandamiyan Street,\nAmbur 635 802')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-[#F2A900]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F2A900] transition-all duration-300">
                                    <Phone className="w-6 h-6 text-[#F2A900] group-hover:text-black transition-colors" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Phone</p>
                                    <a href={`tel:${getSetting('contact_phone', '70109 33658').replace(/\s+/g, '')}`} className="text-white hover:text-[#F2A900] transition-colors text-lg font-mono">
                                        {getSetting('contact_phone', '70109 33658')}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-[#F2A900]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F2A900] transition-all duration-300">
                                    <Mail className="w-6 h-6 text-[#F2A900] group-hover:text-black transition-colors" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Email</p>
                                    <a href={`mailto:${getSetting('contact_email', 'info@bashabiryani.com')}`} className="text-white hover:text-[#F2A900] transition-colors">
                                        {getSetting('contact_email', 'info@bashabiryani.com')}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-8 hover:border-[#F2A900]/60 transition-colors duration-300">
                            <h3 className="text-2xl font-bold text-white mb-6">Opening Hours</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
                                    <div className="flex items-center gap-3 text-white">
                                        <Clock className="w-5 h-5 text-[#F2A900]" />
                                        <span>Monday - Sunday</span>
                                    </div>
                                    <span className="text-[#F2A900] font-mono">{getSetting('contact_opening_hours', '11:00 AM - 10:00 PM')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 bg-green-900/10 p-3 rounded-lg border border-green-900/30">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="font-medium text-sm">We are currently Open for Delivery & Pickup</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-8 lg:p-10 shadow-xl">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20" >
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                                <p className="text-gray-400 mb-8 max-w-sm">
                                    Thank you for contacting us. We will get back to you as soon as possible.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-[#F2A900] hover:text-white underline underline-offset-4"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Send us a Message</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-400">Your Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-gray-400">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all"
                                            placeholder="98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-400">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-gray-400">Subject</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all appearance-none"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Bulk Order / Catering">Bulk Order / Catering</option>
                                        <option value="Feedback">Feedback</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {formData.subject === 'Bulk Order / Catering' && (
                                    <div className="grid md:grid-cols-2 gap-6 bg-[#0a0a0a]/50 p-4 rounded-lg border border-[#F2A900]/20 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <label htmlFor="eventType" className="text-sm font-medium text-gray-400">Event Type</label>
                                            <select
                                                id="eventType"
                                                name="eventType"
                                                value={formData.eventType}
                                                onChange={handleChange}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all"
                                            >
                                                <option value="">Select Event Type</option>
                                                <option value="wedding">Wedding</option>
                                                <option value="corporate">Corporate Event</option>
                                                <option value="birthday">Birthday Party</option>
                                                <option value="anniversary">Anniversary</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="guestCount" className="text-sm font-medium text-gray-400">Estimated Guests</label>
                                            <input
                                                type="number"
                                                id="guestCount"
                                                name="guestCount"
                                                value={formData.guestCount}
                                                onChange={handleChange}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all"
                                                placeholder="e.g. 100"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-gray-400">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] outline-none transition-all resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#F2A900] hover:bg-[#D99700] text-black font-bold text-lg uppercase tracking-wider rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-[#F2A900]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {loading ? 'Sending...' : (
                                        <>
                                            Send Message <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
