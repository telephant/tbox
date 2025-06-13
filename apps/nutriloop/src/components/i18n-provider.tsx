'use client';

import { useEffect } from 'react';
import '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // i18n is already initialized in the import above
    // This component just ensures the i18n is loaded on the client side
  }, []);

  return <>{children}</>;
}
