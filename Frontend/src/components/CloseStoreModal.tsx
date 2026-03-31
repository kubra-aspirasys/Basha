import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CloseStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const DEFAULT_REASONS = [
  "Paused for a bit to manage incoming orders. Back soon!",
  "Experiencing a technical issue. We'll be back shortly!",
  "Experiencing a gas supply disruption. We'll be back soon!",
  "Closed for a routine hygiene check. Back shortly!",
  "Closed due to weather conditions. Stay safe!",
  "Closed for the holiday. We'll be back soon!",
  "We've sold out for today. See you tomorrow!",
  "Closed for the day. See you tomorrow!",
  "Briefly closed for maintenance. We'll be back soon!",
  "Temporarily closed. We'll reopen shortly!",
  "Temporarily unavailable. We'll be back soon!",
];

export default function CloseStoreModal({ isOpen, onClose, onConfirm }: CloseStoreModalProps) {
  const [selectedReason, setSelectedReason] = useState(DEFAULT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalReason = isCustom ? customReason.trim() : selectedReason;
    if (!finalReason) return;
    onConfirm(finalReason);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Pause Order Acceptance
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Customers will see your store as unavailable with the message you select below. You can reopen anytime.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Select Message:
            </label>
            <select
              value={isCustom ? 'custom' : selectedReason}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedReason(val);
                }
              }}
              className="w-full appearance-none px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all text-sm"
            >
              {DEFAULT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="custom">Other (Custom Reason)</option>
            </select>
            
            <div className="pointer-events-none absolute right-10 mt-[-30px] flex items-center text-slate-500 dark:text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          {isCustom && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Type your reason..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isCustom && !customReason.trim()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
