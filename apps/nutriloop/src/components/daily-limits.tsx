'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DailyLimits } from '@/lib/types';
import { db } from '@/lib/db';
import { Settings, Save } from 'lucide-react';

interface DailyLimitsProps {
  initialLimits: DailyLimits;
  onLimitsUpdated: () => void;
}

export function DailyLimitsSettings({ initialLimits, onLimitsUpdated }: DailyLimitsProps) {
  const { t } = useTranslation();
  const [limits, setLimits] = useState<DailyLimits>(initialLimits);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when initial limits change
  useEffect(() => {
    setLimits(initialLimits);
  }, [initialLimits]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.setDailyLimits(limits);
      onLimitsUpdated();
    } catch (error) {
      console.error(t('failedToSaveLimits'), error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof DailyLimits, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setLimits(prev => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('dailyLimits')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium mb-1">
              {t('calories')} ({t('kcal')})
            </label>
            <Input
              id="calories"
              type="number"
              value={limits.calories}
              onChange={(e) => handleInputChange('calories', e.target.value)}
              min="0"
              step="1"
            />
          </div>
          
          <div>
            <label htmlFor="fat" className="block text-sm font-medium mb-1">
              {t('fat')} ({t('grams')})
            </label>
            <Input
              id="fat"
              type="number"
              value={limits.fat}
              onChange={(e) => handleInputChange('fat', e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="protein" className="block text-sm font-medium mb-1">
              {t('protein')} ({t('grams')})
            </label>
            <Input
              id="protein"
              type="number"
              value={limits.protein}
              onChange={(e) => handleInputChange('protein', e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="carbs" className="block text-sm font-medium mb-1">
              {t('carbs')} ({t('grams')})
            </label>
            <Input
              id="carbs"
              type="number"
              value={limits.carbs}
              onChange={(e) => handleInputChange('carbs', e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('saveLimits')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
