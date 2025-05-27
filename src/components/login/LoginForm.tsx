'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import TrustReviewsLogo from '@/components/misc/TrustReviewsLogo';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, rememberMe);
    router.push('/dashboard');
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-eerie-black mb-2">
            User Name
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="stinky@testemail.com"
            className="w-full px-4 py-3 border border-seasalt rounded-lg focus:ring-2 focus:ring-sgbus-green focus:border-transparent transition-colors"
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
              placeholder="Password123@"
              className="w-full px-4 py-3 pr-12 border border-seasalt rounded-lg focus:ring-2 focus:ring-sgbus-green focus:border-transparent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-seasalt hover:text-eerie-black transition-colors"
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
          />
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-sgbus-green hover:bg-sgbus-green text-white font-medium rounded-lg transition-colors"
        >
          LOG IN
        </Button>

      </form>
    </div>
  );
};

export default LoginForm;
