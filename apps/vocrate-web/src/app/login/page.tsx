'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/components/AuthGuard';
import { api } from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { login } = useAuthStore();
  const router = useRouter();

  // Test backend connection
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      console.log('Testing backend connection...');
      const response = await api.get('/health');
      console.log('Backend connection successful:', response.data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setConnectionStatus('error');
      toast.error('Cannot connect to server. Please try again later.');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', data.email);
      await login(data.email, data.password);
      console.log('Login successful, redirecting...');
      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';

      // Show specific error messages
      if (errorMessage.includes('Account not found')) {
        toast.error('Account not found. Please check your email or register for a new account.', {
          duration: 5000,
        });
      } else if (errorMessage.includes('Incorrect password')) {
        toast.error('Incorrect password. Please try again.', {
          duration: 4000,
        });
      } else if (errorMessage.includes('Invalid email')) {
        toast.error('Please enter a valid email address.');
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
        toast.error('Connection error. Please check your internet connection and try again.');
      } else {
        toast.error(errorMessage);
      }

      // Ensure we don't redirect on error
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
            {connectionStatus === 'checking' && (
              <div className="mt-2 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-500">Connecting to server...</span>
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="mt-2 flex items-center justify-center">
                <span className="text-sm text-green-600">✅ Connected</span>
              </div>
            )}
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type="password"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => toast('Password reset feature coming soon!', { icon: 'ℹ️' })}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {connectionStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-600">
                    ⚠️ Cannot connect to server. Please check your connection.
                  </p>
                  <button
                    type="button"
                    onClick={testConnection}
                    className="ml-3 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : connectionStatus === 'checking' ? 'Connecting...' : 'Sign in'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&rsquo;t have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
