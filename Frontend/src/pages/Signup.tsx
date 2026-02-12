import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { CircleAlert as AlertCircle, CheckCircle2, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
      });

      if (success) {
        toast({
          title: 'Account created successfully!',
          description: 'Welcome to Basha Biryani',
        });
        navigate('/');
      } else {
        setError('Email already exists. Please use a different email or login.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-5 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">

        {/* Left Side - Visual Branding */}
        <div className="hidden lg:flex lg:col-span-2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700 opacity-90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-400 rounded-full blur-3xl opacity-20"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex flex-col gap-4 mb-6">
              <img src="/logo-min.webp" alt="Basha Biryani" className="h-20 w-auto object-contain" />
              <span className="text-2xl font-bold tracking-tight text-white">Basha Biryani</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Experience the <span className="text-amber-200">Authentic Taste</span> of Tradition.
            </h1>
            <p className="text-amber-100/80 text-lg leading-relaxed">
              Join our community of food lovers and get exclusive access to the finest Hyderabadi cuisine delivered to your doorstep.
            </p>
          </div>

          <div className="relative z-10 glass-effect bg-white/10 border-white/10 rounded-2xl p-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500 rounded-full shadow-lg shadow-amber-900/20">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">Did you know?</p>
                <p className="text-amber-100/70 text-xs">
                  Our biryani is slow-cooked in traditional 'Dum' style for over 4 hours to ensure every grain of rice is perfectly flavored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create an Account</h2>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your details below to set up your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-11 shadow-sm focus:ring-amber-500/20 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-11 shadow-sm focus:ring-amber-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 shadow-sm focus:ring-amber-500/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-11 pr-10 shadow-sm focus:ring-amber-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-11 pr-10 shadow-sm focus:ring-amber-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address (Optional)</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Apartment, Street, Area..."
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="min-h-[80px] shadow-sm resize-none focus:ring-amber-500/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300 text-xs leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>By signing up, you agree to receive order updates via email and SMS. We respect your privacy and never spam.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
