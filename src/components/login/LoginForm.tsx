'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import TrustReviewsLogo from '@/components/misc/TrustReviewsLogo';
import { toast } from 'sonner';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Attempting login...');
      const user = await login(email, password);
      console.log('Login successful:', user);
      console.log('Redirecting to dashboard...');
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      const errorCode = error.code;
      let errorMsg = 'Failed to login';
      
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMsg = 'Invalid email format.';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please try again later.';
      } else if (errorCode === 'auth/network-request-failed') {
        errorMsg = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrustReviewsLogo/>
        </div>
        <h2 className="text-4xl font-light text-sgbus-green mb-2">
          Welcome Back
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-eerie-black mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-seasalt rounded-lg focus:ring-2 focus:ring-sgbus-green focus:border-transparent transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-eerie-black mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border border-seasalt rounded-lg focus:ring-2 focus:ring-sgbus-green focus:border-transparent transition-colors"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-seasalt hover:text-eerie-black transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-seasalt data-[state=checked]:bg-sgbus-green data-[state=checked]:border-sgbus-green"
            disabled={isLoading}
          />
          <label htmlFor="remember" className="text-sm text-eerie-black">
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-sgbus-green hover:bg-sgbus-green text-white font-medium rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              LOGGING IN...
            </span>
          ) : (
            'LOG IN'
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
