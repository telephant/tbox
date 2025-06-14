'use client';

import { useEffect, useState } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Only import i18n on the client side
    import('@/lib/i18n');
  }, []);

  // During SSR, render without i18n
  if (!isClient) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
