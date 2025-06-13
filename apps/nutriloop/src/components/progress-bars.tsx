'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { DailyProgress } from '@/lib/types';
import { formatNutritionValue } from '@/lib/utils';
import { Target } from 'lucide-react';

interface ProgressBarsProps {
  progress: DailyProgress;
}

export function ProgressBars({ progress }: ProgressBarsProps) {
  const { t } = useTranslation();

  const nutrients = [
    {
      name: t('calories'),
      key: 'calories' as const,
      unit: t('kcal'),
      color: 'bg-blue-500',
    },
    {
      name: t('fat'),
      key: 'fat' as const,
      unit: t('grams'),
      color: 'bg-yellow-500',
    },
    {
      name: t('protein'),
      key: 'protein' as const,
      unit: t('grams'),
      color: 'bg-green-500',
    },
    {
      name: t('carbs'),
      key: 'carbs' as const,
      unit: t('grams'),
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('dailyProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {nutrients.map((nutrient) => {
          const consumed = progress.consumed[nutrient.key];
          const limit = progress.limits[nutrient.key];
          const percentage = progress.percentage[nutrient.key];
          
          return (
            <div key={nutrient.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{nutrient.name}</span>
                <span className="text-sm text-gray-600">
                  {formatNutritionValue(consumed, nutrient.unit)} / {formatNutritionValue(limit, nutrient.unit)}
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={consumed} 
                  max={limit}
                  className="h-3"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all ${nutrient.color}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage}{t('dailyGoal')}</span>
                {percentage > 100 && (
                  <span className="text-red-500 font-medium">
                    {formatNutritionValue(consumed - limit, nutrient.unit)} {t('over')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
