import { LogOut, X } from 'lucide-react';

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    variant?: 'admin' | 'customer';
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, variant = 'customer' }: LogoutConfirmModalProps) {
    if (!isOpen) return null;

    const isAdmin = variant === 'admin';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={`rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden ${isAdmin
                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    : 'bg-[#1a1a1a] border border-[#F2A900]/30'
                    }`}
            >
                {/* Header */}
                <div className={`px-6 pt-6 pb-4 flex justify-between items-start ${isAdmin ? '' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${isAdmin
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-red-900/20'
                                }`}
                        >
                            <LogOut className={`w-6 h-6 ${isAdmin ? 'text-red-600 dark:text-red-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isAdmin ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                                Logout
                            </h3>
                            <p className={`text-sm ${isAdmin ? 'text-slate-500 dark:text-slate-400' : 'text-gray-400'}`}>
                                End your session
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg transition-colors ${isAdmin
                            ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                            : 'hover:bg-white/10 text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-4">
                    <p className={`text-sm leading-relaxed ${isAdmin ? 'text-slate-600 dark:text-slate-300' : 'text-gray-300'}`}>
                        Are you sure you want to logout? You will need to sign in again to access your account.
                    </p>
                </div>

                {/* Actions */}
                <div className={`px-6 pb-6 flex gap-3`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isAdmin
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-[#F2A900]/10'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isAdmin
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                            }`}
                    >
                        <LogOut className="w-4 h-4" />
                        Yes, Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
