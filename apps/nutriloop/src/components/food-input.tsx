'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { nutritionService } from '@/lib/openai';
import { db } from '@/lib/db';
import { getTodayDateString, formatNutritionValue } from '@/lib/utils';
import { Plus, Loader2, Eye, Check } from 'lucide-react';
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

      // Use preview nutrition if available, otherwise fetch from API
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

      // Reset form
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

  // Clear preview when inputs change
  const handleInputChange = (field: 'name' | 'weight' | 'unit', value: string) => {
    if (field === 'name') {
      setFoodName(value);
    } else if (field === 'weight') {
      setWeight(value);
    } else if (field === 'unit') {
      setUnit(value as 'g' | 'ml');
    }
    // Clear preview when inputs change
    if (previewNutrition) {
      setPreviewNutrition(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {t('addFood')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="food-name" className="block text-sm font-medium mb-1">
              {t('foodName')}
            </label>
            <Input
              id="food-name"
              type="text"
              placeholder={t('foodNamePlaceholder')}
              value={foodName}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading || isPreviewLoading}
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-1">
              {t('weight')}
            </label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                placeholder={t('weightPlaceholder')}
                value={weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                disabled={isLoading || isPreviewLoading}
                min="0"
                step="0.1"
                className="flex-1"
              />
              <Select
                value={unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                disabled={isLoading || isPreviewLoading}
                className="w-20"
              >
                <option value="g">{t('grams')}</option>
                <option value="ml">{t('milliliters')}</option>
              </Select>
            </div>
          </div>

          {/* Preview Nutrition Display */}
          {previewNutrition && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <Check className="h-4 w-4" />
                {t('nutritionPreview')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-700 dark:text-green-300">
                    {formatNutritionValue(previewNutrition.calories, 'kcal')}
                  </div>
                  <div className="text-green-600 dark:text-green-400">{t('calories')}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700 dark:text-green-300">
                    {formatNutritionValue(previewNutrition.fat, 'g')}
                  </div>
                  <div className="text-green-600 dark:text-green-400">{t('fat')}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700 dark:text-green-300">
                    {formatNutritionValue(previewNutrition.protein, 'g')}
                  </div>
                  <div className="text-green-600 dark:text-green-400">{t('protein')}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700 dark:text-green-300">
                    {formatNutritionValue(previewNutrition.carbs, 'g')}
                  </div>
                  <div className="text-green-600 dark:text-green-400">{t('carbs')}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading || isPreviewLoading || !foodName.trim() || !weight.trim()}
              className="flex-1"
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
              className="flex-1"
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
