'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FoodEntry } from '@/lib/types';
import { formatNutritionValue } from '@/lib/utils';
import { db } from '@/lib/db';
import { History, Trash2, UtensilsCrossed } from 'lucide-react';

interface FoodLogProps {
  entries: FoodEntry[];
  onEntryDeleted: () => void;
}

export function FoodLog({ entries, onEntryDeleted }: FoodLogProps) {
  const { t, ready } = useTranslation();

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

  const safeEntries = Array.isArray(entries) ? entries : [];

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600 hover:from-orange-500 hover:via-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          {t('todaysFoodLog')}
          {safeEntries.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({safeEntries.length} {t('items')})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {safeEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 flex items-center justify-center">
              <History className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('noFoodEntries')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('addFirstMeal')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeEntries.map((entry) => (
              <div
                key={entry.id}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500/5 to-amber-500/5 hover:from-orange-500/10 hover:to-amber-500/10 transition-all duration-300"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm">
                        <span className="text-xl" role="img" aria-label={entry.name}>
                          🍽️
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium capitalize text-sm">{entry.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.weight}{entry.unit}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 dark:hover:text-red-400 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex items-center gap-1.5">
                      <span role="img" aria-label="calories" className="text-base">🔥</span>
                      <div className="text-xs">
                        <div className="font-medium">
                          {formatNutritionValue(entry.nutrition.calories, 'kcal')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">{t('calories')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span role="img" aria-label="protein" className="text-base">🥩</span>
                      <div className="text-xs">
                        <div className="font-medium">
                          {formatNutritionValue(entry.nutrition.protein, 'g')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">{t('protein')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span role="img" aria-label="fat" className="text-base">🥑</span>
                      <div className="text-xs">
                        <div className="font-medium">
                          {formatNutritionValue(entry.nutrition.fat, 'g')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">{t('fat')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span role="img" aria-label="carbs" className="text-base">🍚</span>
                      <div className="text-xs">
                        <div className="font-medium">
                          {formatNutritionValue(entry.nutrition.carbs, 'g')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">{t('carbs')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
