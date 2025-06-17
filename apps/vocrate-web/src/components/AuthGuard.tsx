'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Add a small delay to prevent race conditions during login
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          console.log('AuthGuard: Redirecting to login - not authenticated');
          router.push('/login');
        } else if (!requireAuth && isAuthenticated) {
          console.log('AuthGuard: Redirecting to home - already authenticated');
          router.push('/');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
