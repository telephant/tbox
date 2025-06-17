'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FoodEntry } from '@/lib/types';
import { formatNutritionValue } from '@/lib/utils';
import { db } from '@/lib/db';
import { History, Trash2 } from 'lucide-react';

interface FoodLogProps {
  entries: FoodEntry[];
  onEntryDeleted: () => void;
}

export function FoodLog({ entries, onEntryDeleted }: FoodLogProps) {
  const { t, ready } = useTranslation();

  // Don't render until translations are ready
  if (!ready) {
    return null;
  }

  const handleDelete = async (id: string) => {
    try {
      await db.deleteFoodEntry(id);
      onEntryDeleted();
    } catch (error) {
      console.error(t('failedToDeleteEntry'), error);
    }
  };

  // Ensure entries is always an array
  const safeEntries = Array.isArray(entries) ? entries : [];

  if (safeEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('todaysFoodLog')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium capitalize">{entry.name}</h4>
                  <span className="text-sm text-gray-500">({entry.weight}{entry.unit})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                  <span>{formatNutritionValue(entry.nutrition.calories, 'kcal')}</span>
                  <span>{formatNutritionValue(entry.nutrition.fat, 'g')} fat</span>
                  <span>{formatNutritionValue(entry.nutrition.protein, 'g')} protein</span>
                  <span>{formatNutritionValue(entry.nutrition.carbs, 'g')} carbs</span>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
