'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
      color: 'from-rose-200/20 via-pink-300/20 to-rose-300/20',
      ringColor: 'stroke-rose-500',
      icon: '🔥',
    },
    {
      name: t('protein'),
      key: 'protein' as const,
      unit: t('grams'),
      color: 'from-teal-200/20 via-emerald-300/20 to-green-300/20',
      ringColor: 'stroke-emerald-500',
      icon: '🥩',
    },
    {
      name: t('fat'),
      key: 'fat' as const,
      unit: t('grams'),
      color: 'from-amber-200/20 via-orange-300/20 to-amber-300/20',
      ringColor: 'stroke-orange-500',
      icon: '🥑',
    },
    {
      name: t('carbs'),
      key: 'carbs' as const,
      unit: t('grams'),
      color: 'from-blue-200/20 via-indigo-300/20 to-blue-300/20',
      ringColor: 'stroke-blue-500',
      icon: '🍚',
    },
  ];

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-white/80 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <Target className="h-4 w-4" />
          </div>
          {t('dailyProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {nutrients.map((nutrient) => {
            const consumed = progress.consumed[nutrient.key];
            const limit = progress.limits[nutrient.key];
            const percentage = progress.percentage[nutrient.key];
            const isOverLimit = percentage > 100;
            const radius = 32;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
            
            return (
              <div key={nutrient.key} className="relative flex flex-col items-center">
                <div className={`
                  relative p-6 rounded-2xl bg-gradient-to-br ${nutrient.color}
                  transform transition-all duration-300 
                  hover:scale-105 group border border-white/10 dark:border-gray-800/10
                  backdrop-blur-sm
                  ${isOverLimit ? 'animate-pulse' : ''}
                `}>
                  <div className="relative w-24 h-24">
                    {/* Background ring */}
                    <svg className="w-full h-full -rotate-90 transform">
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-white dark:stroke-gray-700"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress ring */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className={`${nutrient.ringColor} transition-all duration-500`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        style={{
                          strokeDasharray,
                          strokeDashoffset,
                        }}
                      />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl transform transition-all duration-300 group-hover:scale-110" role="img" aria-label={nutrient.name}>
                        {nutrient.icon}
                      </span>
                      <span className={`text-sm font-medium mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                  {/* Nutrient details */}
                  <div className="text-center mt-3">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {nutrient.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {formatNutritionValue(consumed, nutrient.unit)} / {formatNutritionValue(limit, nutrient.unit)}
                    </p>
                    {isOverLimit && (
                      <div className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 animate-pulse">
                        +{formatNutritionValue(consumed - limit, nutrient.unit)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
