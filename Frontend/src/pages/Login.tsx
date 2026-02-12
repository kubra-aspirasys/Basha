import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleAlert as AlertCircle, User, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, activeRole);
      if (success) {
        toast({
          title: 'Login successful',
          description: `Welcome back to Basha Biryani${activeRole === 'admin' ? ' Admin Panel' : ''}`,
        });
        navigate(activeRole === 'admin' ? '/admin/dashboard' : '/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
        <div className="h-2 gradient-primary w-full" />
        <CardHeader className="space-y-1 pb-6 text-center sm:text-left">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Login
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
              <TabsTrigger
                value="customer"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm flex items-center gap-2 font-semibold transition-all"
              >
                <User className="w-4 h-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm flex items-center gap-2 font-semibold transition-all"
              >
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={activeRole === 'admin' ? 'your@email.com' : 'your@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-amber-500/20 transition-all rounded-xl dark:bg-slate-800/50 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-amber-500/20 transition-all pr-12 rounded-xl dark:bg-slate-800/50 dark:border-slate-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 transition-colors"
                onClick={() => navigate(`/${activeRole === 'admin' ? 'admin/' : ''}forgot-password`)}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : 'Login'}
            </Button>

            <div className="pt-2">
              {activeRole === 'customer' && (
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                    Sign up
                  </Link>
                </div>
              )}

              {/* <div className="mt-8 flex flex-col gap-3">
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${activeRole === 'customer' ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'}`}>
                  <p className={`text-xs text-center font-medium ${activeRole === 'customer' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {activeRole === 'customer' ? (
                      <><strong>Demo Customer:</strong> customer@bashabiryani.com / customer123</>
                    ) : (
                      <><strong>Demo Admin:</strong> admin@bashabiryani.com / admin123</>
                    )}
                  </p>
                </div>
              </div> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
