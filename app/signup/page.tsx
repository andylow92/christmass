'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Snowflake, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Sign in automatically after signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in. Please try logging in.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 text-red-300/30 animate-pulse">
        <Snowflake className="h-16 w-16" />
      </div>
      <div className="absolute top-1/4 left-10 text-green-300/30 animate-pulse" style={{ animationDelay: '1s' }}>
        <Sparkles className="h-12 w-12" />
      </div>
      <div className="absolute bottom-1/4 right-20 text-red-300/30 animate-pulse" style={{ animationDelay: '2s' }}>
        <Sparkles className="h-14 w-14" />
      </div>
      <div className="absolute bottom-10 left-10 text-green-300/30 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <Snowflake className="h-20 w-20" />
      </div>

      <Card className="w-full max-w-md glass-strong shadow-2xl border-white/30 relative z-10 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-red-500/20 animate-pulse" style={{ animationDuration: '3s' }}></div>

        <CardHeader className="space-y-3 text-center relative z-10 pb-8">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <Gift className="h-16 w-16 text-white drop-shadow-lg" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-white drop-shadow-lg">
            Join Christmas Wishlist
          </CardTitle>
          <p className="text-white/90 text-sm drop-shadow">Create your account to start making wishes</p>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90 font-medium">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:ring-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="santa@northpole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:ring-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:ring-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="glass border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:ring-white/30"
              />
            </div>

            {error && (
              <div className="glass-strong text-red-200 text-sm text-center p-3 rounded-lg border border-red-300/30 shadow-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-red-600 hover:from-green-600 hover:to-red-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-white/70 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-5 glass-strong border-white/30 hover:bg-white/20 text-white py-6"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-white/70">Already have an account? </span>
            <Link
              href="/login"
              className="text-white font-semibold hover:text-yellow-200 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
