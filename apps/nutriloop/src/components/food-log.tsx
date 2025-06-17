'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FoodEntry, NutritionInfo } from '@/lib/types';
import { formatNutritionValue } from '@/lib/utils';
import { db } from '@/lib/db';
import { History, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface FoodLogProps {
  entries: FoodEntry[];
  onEntryDeleted: () => void;
}

interface NutrientField {
  key: keyof NutritionInfo;
  unit: string;
}

export function FoodLog({ entries, onEntryDeleted }: FoodLogProps) {
  const { t } = useTranslation();
  const safeEntries = Array.isArray(entries) ? entries : [];

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

  const handleDelete = async (id: string) => {
    try {
      await db.deleteFoodEntry(id);
      onEntryDeleted();
    } catch (error) {
      console.error(t('failedToDeleteEntry'), error);
    }
  };

  if (safeEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('todaysFoodLog')} (0 {t('items')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>{t('noFoodEntries')}</p>
            <p className="text-sm">{t('addFirstMeal')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t('todaysFoodLog')} ({safeEntries.length} {t('items')})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {safeEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium capitalize">{entry.name}</h4>
                    <span className="text-sm text-gray-500">({entry.weight}{entry.unit})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                    {categories.macros.map((nutrient) => (
                      <span key={nutrient.key}>
                        {formatNutritionValue(entry.nutrition[nutrient.key], nutrient.unit)} {t(nutrient.key)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Accordion type="single" collapsible className="border-t border-gray-200 dark:border-gray-700">
                <AccordionItem value="details">
                  <AccordionTrigger className="px-4 py-2 text-sm">
                    {t('moreDetails')}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {Object.entries(categories).slice(1).map(([category, nutrients]) => (
                        <div key={category}>
                          <h5 className="font-medium mb-2 text-sm">{t(category)}</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                            {nutrients.map((nutrient) => (
                              <div key={nutrient.key}>
                                {formatNutritionValue(entry.nutrition[nutrient.key], nutrient.unit)} {t(nutrient.key)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
