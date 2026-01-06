import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { CircleHelp as HelpCircle, Plus, Trash2, CreditCard as Edit2, Eye, EyeOff, X } from 'lucide-react';
import { FAQ } from '@/types/cms';

export default function FAQManager() {
  const {
    faqs,
    loading,
    fetchFAQs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
  } = useCMSEnhancedStore();

  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      is_active: true,
      display_order: 0,
    });
    setEditingFAQ(null);
    setShowForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_active: faq.is_active,
      display_order: faq.display_order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFAQ) {
      await updateFAQ(editingFAQ.id, formData);
    } else {
      await addFAQ(formData);
    }
    resetForm();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateFAQ(id, { is_active: !isActive });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      await deleteFAQ(id);
    }
  };

  const categories = ['general', 'ordering', 'delivery', 'payment', 'account', 'food'];

  const faqsByCategory = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            FAQ Management
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 gradient-primary text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add FAQ'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
                placeholder="Enter the question..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={4}
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
                placeholder="Enter the answer..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="faq_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="faq_is_active" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Active
              </label>
            </div>

            <button
              type="submit"
              disabled={!formData.question || !formData.answer}
              className="w-full sm:w-auto px-6 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </form>
        )}

        {/* Sample FAQ Content */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Frequently Asked Questions
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Find answers to common questions about our catering services
          </p>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                How far in advance should I book catering services?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We recommend booking at least 2-4 weeks in advance for standard events, and 6-8 weeks for weddings or large corporate events to ensure availability and proper planning.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                Do you provide setup and cleanup services?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Yes, we provide complete setup and cleanup services. Our team will arrive early to set up all equipment, serve the food, and clean up afterward, leaving your venue spotless.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                Can you accommodate dietary restrictions and allergies?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Absolutely! We can accommodate vegetarian, vegan, gluten-free, and other dietary restrictions. Please inform us of any allergies or special dietary needs when placing your order.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                What is your minimum order requirement?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Our minimum order is typically 25 people for delivery and 50 people for full-service catering. However, we can accommodate smaller orders with a minimum service charge.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                Do you offer tastings before the event?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Yes, we offer complimentary tastings for events with 100+ guests. For smaller events, we can arrange tastings for a nominal fee that will be credited toward your final bill.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                What payment methods do you accept?
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We accept all major credit cards, bank transfers, UPI payments, and cash. A 50% deposit is required to confirm your booking, with the balance due 48 hours before the event.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading FAQs...</div>
        ) : (
          <div className="space-y-6">
            {Object.keys(faqsByCategory).length === 0 ? (
              <p className="text-center text-slate-500 py-8">No custom FAQs yet. Add your first FAQ!</p>
            ) : (
              Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                <div key={category}>
                  <h4 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white mb-3 capitalize">
                    {category}
                  </h4>
                  <div className="space-y-3">
                    {categoryFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-2 text-sm sm:text-base">
                              <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500" />
                              {faq.question}
                            </h5>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-6">
                              {faq.answer}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2 ml-6">
                              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                Order: {faq.display_order}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${faq.is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {faq.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="px-3 py-1.5 bg-info text-white rounded text-xs sm:text-sm hover:bg-info/90 flex items-center justify-center gap-1 flex-1 sm:flex-none"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleActive(faq.id, faq.is_active)}
                              className="px-3 py-1.5 bg-slate-500 text-white rounded text-xs sm:text-sm hover:bg-slate-600 flex items-center justify-center gap-1 flex-1 sm:flex-none"
                            >
                              {faq.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span className="hidden sm:inline">{faq.is_active ? 'Hide' : 'Show'}</span>
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="px-3 py-1.5 bg-error text-white rounded text-xs sm:text-sm hover:bg-error/90 flex items-center justify-center gap-1 flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
