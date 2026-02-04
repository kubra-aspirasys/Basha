import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleCheck as CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await forgotPassword(email);
      if (success) {
        setSent(true);
        toast({
          title: 'Reset link sent',
          description: 'Check your email for password reset instructions',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to send reset link. Please verify your email.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            Password reset instructions sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-success/10 dark:bg-success/20 border-success/20 dark:border-success/30">
            <CheckCircle className="h-4 w-4 text-success dark:text-success" />
            <AlertDescription className="text-success dark:text-success">
              We've sent password reset instructions to {email}. Please check
              your inbox and follow the link to reset your password.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate('/admin/login')}
            className="w-full mt-4 bg-gold-500 hover:bg-gold-600 text-white"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@srfoodkraft.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-white"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/admin/login')}
          >
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
