import { useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { login, signup } = useAuthStore();

    // Login form
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Signup form
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
    });

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(loginData.email, loginData.password, 'customer');
            if (success) {
                onSuccess();
                onClose();
            } else {
                setError('Invalid email or password');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (signupData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!/^[0-9]{10}$/.test(signupData.phone.replace(/[^0-9]/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);

        try {
            const success = await signup({
                name: signupData.name,
                email: signupData.email,
                phone: signupData.phone,
                password: signupData.password,
                address: signupData.address,
            });

            if (success) {
                onSuccess();
                onClose();
            } else {
                setError('Email already exists. Try a different email or login.');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setError('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#F2A900]/30 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#F2A900]/20 px-6 py-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F2A900]/10 rounded-full flex items-center justify-center">
                            {mode === 'login' ? (
                                <LogIn className="w-5 h-5 text-[#F2A900]" />
                            ) : (
                                <UserPlus className="w-5 h-5 text-[#F2A900]" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-xs text-gray-400">
                                {mode === 'login' ? 'Sign in to add items to your cart' : 'Sign up to start ordering'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F2A900]/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="px-6 pt-5">
                    <div className="flex bg-[#0f0f0f] rounded-lg p-1 border border-[#F2A900]/10">
                        <button
                            onClick={() => switchMode('login')}
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${mode === 'login'
                                    ? 'bg-[#F2A900] text-black shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => switchMode('signup')}
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${mode === 'signup'
                                    ? 'bg-[#F2A900] text-black shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Forms */}
                <div className="p-6">
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full px-4 py-3 pr-12 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchMode('signup')}
                                    className="text-[#F2A900] hover:text-[#D99700] font-semibold transition-colors"
                                >
                                    Sign up
                                </button>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={signupData.name}
                                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Phone</label>
                                    <input
                                        type="tel"
                                        value={signupData.phone}
                                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                        placeholder="98765 43210"
                                        required
                                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={signupData.email}
                                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            placeholder="Min 6 chars"
                                            required
                                            className="w-full px-4 py-3 pr-10 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300">Confirm</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={signupData.confirmPassword}
                                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                            placeholder="Re-enter"
                                            required
                                            className="w-full px-4 py-3 pr-10 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Address <span className="text-gray-500">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={signupData.address}
                                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                                    placeholder="Delivery address..."
                                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Create Account
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-[#F2A900] hover:text-[#D99700] font-semibold transition-colors"
                                >
                                    Login
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
