'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DailyLimits, NutritionInfo } from '@/lib/types';
import { db } from '@/lib/db';
import { Settings, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface DailyLimitsProps {
  initialLimits: DailyLimits;
  onLimitsUpdated: () => void;
}

interface NutrientField {
  key: keyof NutritionInfo;
  unit: string;
}

export function DailyLimitsSettings({ initialLimits, onLimitsUpdated }: DailyLimitsProps) {
  const { t } = useTranslation();
  const [limits, setLimits] = useState<DailyLimits>(initialLimits);
  const [isSaving, setIsSaving] = useState(false);

  const categories: Record<string, NutrientField[]> = {
    macros: [
      { key: 'calories', unit: t('kcal') },
      { key: 'fat', unit: t('grams') },
      { key: 'protein', unit: t('grams') },
      { key: 'carbs', unit: t('grams') }
    ],
    minerals: [
      { key: 'sodium', unit: t('mg') },
      { key: 'potassium', unit: t('mg') },
      { key: 'calcium', unit: t('mg') },
      { key: 'magnesium', unit: t('mg') },
      { key: 'iron', unit: t('mg') },
      { key: 'zinc', unit: t('mg') }
    ],
    vitamins: [
      { key: 'vitaminA', unit: 'μg' },
      { key: 'vitaminC', unit: t('mg') },
      { key: 'vitaminD', unit: 'μg' },
      { key: 'vitaminE', unit: t('mg') },
      { key: 'vitaminK', unit: 'μg' },
      { key: 'vitaminB1', unit: t('mg') },
      { key: 'vitaminB6', unit: t('mg') },
      { key: 'vitaminB12', unit: 'μg' }
    ],
    others: [
      { key: 'cholesterol', unit: t('mg') },
      { key: 'sugar', unit: t('grams') },
      { key: 'saturatedFat', unit: t('grams') },
      { key: 'transFat', unit: t('grams') },
      { key: 'omega3', unit: t('grams') },
      { key: 'omega6', unit: t('grams') }
    ]
  };

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
    // Allow empty string and valid numeric inputs (including single decimal point)
    if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
      if (value === '' || value === '.') {
        setLimits(prev => ({
          ...prev,
          [field]: 0,
        }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          setLimits(prev => ({
            ...prev,
            [field]: numValue,
          }));
        }
      }
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
      <CardContent>
        <Accordion type="multiple" defaultValue={['macros']} className="space-y-4">
          {Object.entries(categories).map(([category, nutrients]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-lg font-semibold">
                {t(category)}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {nutrients.map((nutrient) => (
                    <div key={nutrient.key}>
                      <label htmlFor={nutrient.key} className="block text-sm font-medium mb-1">
                        {t(nutrient.key)} ({nutrient.unit})
                      </label>
                      <Input
                        id={nutrient.key}
                        type="text"
                        inputMode="decimal"
                        value={limits[nutrient.key]?.toString() || '0'}
                        onChange={(e) => handleInputChange(nutrient.key, e.target.value)}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter, decimal point
                          if (
                            e.key === 'Backspace' ||
                            e.key === 'Delete' ||
                            e.key === 'Tab' ||
                            e.key === 'Escape' ||
                            e.key === 'Enter' ||
                            e.key === '.' ||
                            e.key === 'ArrowLeft' ||
                            e.key === 'ArrowRight' ||
                            e.key === 'ArrowUp' ||
                            e.key === 'ArrowDown'
                          ) {
                            return;
                          }
                          // Block non-numeric keys
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6">
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
