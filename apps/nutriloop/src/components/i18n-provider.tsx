'use client';

import { useEffect, useState } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [i18nError, setI18nError] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Only import i18n on the client side with error handling
    import('@/lib/i18n').catch((error) => {
      console.error('Failed to load i18n:', error);
      setI18nError(true);
    });
  }, []);

  // During SSR, render without i18n
  if (!isClient) {
    return <>{children}</>;
  }

  // If i18n failed to load, still render children
  if (i18nError) {
    console.warn('i18n failed to load, rendering without translations');
  }

  return <>{children}</>;
}
