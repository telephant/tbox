'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { nutritionService } from '@/lib/openai';
import { db } from '@/lib/db';
import { getTodayDateString, formatNutritionValue } from '@/lib/utils';
import { Plus, Loader2, Eye, Check, UtensilsCrossed } from 'lucide-react';
import { NutritionInfo } from '@/lib/types';

interface FoodInputProps {
  onFoodAdded: () => void;
}

export function FoodInput({ onFoodAdded }: FoodInputProps) {
  const { t } = useTranslation();
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewNutrition, setPreviewNutrition] = useState<NutritionInfo | null>(null);

  const handlePreview = async () => {
    if (!foodName.trim() || !weight.trim()) {
      setError(t('enterBothFields'));
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError(t('enterValidWeight'));
      return;
    }

    setIsPreviewLoading(true);
    setError('');

    try {
      const nutrition = await nutritionService.getNutritionInfo(foodName.trim(), weightNum, unit);
      setPreviewNutrition(nutrition);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToGetNutrition'));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName.trim() || !weight.trim()) {
      setError(t('enterBothFields'));
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError(t('enterValidWeight'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let nutrition: NutritionInfo;
      if (previewNutrition) {
        nutrition = previewNutrition;
      } else {
        nutrition = await nutritionService.getNutritionInfo(foodName.trim(), weightNum, unit);
      }

      await db.addFoodEntry({
        name: foodName.trim(),
        weight: weightNum,
        unit,
        nutrition,
        date: getTodayDateString(),
      });

      setFoodName('');
      setWeight('');
      setUnit('g');
      setPreviewNutrition(null);
      onFoodAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToAddFood'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          {t('addFood')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Food Name Input */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('foodName')}
              </div>
              <Input
                type="text"
                placeholder={t('foodNamePlaceholder')}
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                disabled={isLoading || isPreviewLoading}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Weight Input with Unit */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('weight')}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('weightPlaceholder')}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={isLoading || isPreviewLoading}
                  min="0"
                  step="0.1"
                  className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
                <Select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'g' | 'ml')}
                  disabled={isLoading || isPreviewLoading}
                  className="w-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="g">{t('grams')}</option>
                  <option value="ml">{t('milliliters')}</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          {previewNutrition && (
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/5 p-4 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                <Check className="h-4 w-4" />
                {t('nutritionPreview')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="calories" className="text-xl">🔥</span>
                  <div className="text-sm">
                    <div className="font-medium">{formatNutritionValue(previewNutrition.calories, 'kcal')}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('calories')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="protein" className="text-xl">🥩</span>
                  <div className="text-sm">
                    <div className="font-medium">{formatNutritionValue(previewNutrition.protein, 'g')}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('protein')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="fat" className="text-xl">🥑</span>
                  <div className="text-sm">
                    <div className="font-medium">{formatNutritionValue(previewNutrition.fat, 'g')}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('fat')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="carbs" className="text-xl">🍚</span>
                  <div className="text-sm">
                    <div className="font-medium">{formatNutritionValue(previewNutrition.carbs, 'g')}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('carbs')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100/50 dark:bg-red-900/20 dark:text-red-400 rounded-lg animate-shake">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading || isPreviewLoading || !foodName.trim() || !weight.trim()}
              className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              {isPreviewLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('gettingInfo')}
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('preview')}
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={isLoading || isPreviewLoading}
              className="flex-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700 text-white transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('adding')}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addFood')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
