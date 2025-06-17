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
import { Plus, Loader2, Eye } from 'lucide-react';
import { NutritionInfo, Unit } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { textStyles } from '@/lib/styles';

interface FoodInputProps {
  onFoodAdded: () => void;
}

interface NutrientField {
  key: keyof NutritionInfo;
  unit: string;
}

export function FoodInput({ onFoodAdded }: FoodInputProps) {
  const { t } = useTranslation();
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<Unit>('g' as Unit);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewNutrition, setPreviewNutrition] = useState<NutritionInfo | null>(null);

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

  const handleInputChange = (field: string, value: string) => {
    if (field === 'foodName') {
      setFoodName(value);
      setPreviewNutrition(null);
    } else if (field === 'weight') {
      if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
        setWeight(value);
        setPreviewNutrition(null);
      }
    } else if (field === 'unit') {
      setUnit(value as Unit);
      setPreviewNutrition(null);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Plus className="h-5 w-5" />
          {t('addFood')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="foodName" className={textStyles.label}>
              {t('foodName')}
            </label>
            <Input
              id="foodName"
              placeholder={t('foodNamePlaceholder')}
              value={foodName}
              onChange={(e) => handleInputChange('foodName', e.target.value)}
              disabled={isLoading || isPreviewLoading}
            />
          </div>

          <div>
            <label htmlFor="weight" className={textStyles.label}>
              {t('weight')}
            </label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="text"
                inputMode="decimal"
                placeholder={t('weightPlaceholder')}
                value={weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                disabled={isLoading || isPreviewLoading}
                onKeyDown={(e) => {
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
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <Select
                value={unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                disabled={isLoading || isPreviewLoading}
                className="w-24"
              >
                <option value="g">{t('grams')}</option>
                <option value="ml">{t('milliliters')}</option>
                <option value="piece">{t('pieces')}</option>
              </Select>
            </div>
          </div>

          {error && <div className={textStyles.error}>{error}</div>}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handlePreview}
              disabled={isLoading || isPreviewLoading}
              variant="secondary"
              className="flex-1"
            >
              {isPreviewLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading')}
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
                  {t('add')}
                </>
              )}
            </Button>
          </div>
        </form>

        {previewNutrition && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Accordion type="multiple" defaultValue={['macros']} className="space-y-2">
              {Object.entries(categories).map(([category, nutrients]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger>
                    {t(category)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {nutrients.map((nutrient) => (
                        <div key={nutrient.key} className="text-sm">
                          <span className="block text-gray-600 dark:text-gray-400">
                            {t(nutrient.key)}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatNutritionValue(previewNutrition[nutrient.key], nutrient.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
