'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { DailyProgress, NutritionInfo } from '@/lib/types';
import { formatNutritionValue } from '@/lib/utils';
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface NutrientInfo {
  name: string;
  key: keyof NutritionInfo;
  unit: string;
  color: string;
}

interface ProgressBarsProps {
  progress: DailyProgress;
}

export function ProgressBars({ progress }: ProgressBarsProps) {
  const { t } = useTranslation();

  const categories: Record<string, NutrientInfo[]> = {
    macros: [
      { name: t('calories'), key: 'calories', unit: t('kcal'), color: 'bg-blue-500' },
      { name: t('fat'), key: 'fat', unit: t('grams'), color: 'bg-yellow-500' },
      { name: t('protein'), key: 'protein', unit: t('grams'), color: 'bg-green-500' },
      { name: t('carbs'), key: 'carbs', unit: t('grams'), color: 'bg-purple-500' }
    ],
    minerals: [
      { name: t('sodium'), key: 'sodium', unit: t('mg'), color: 'bg-orange-500' },
      { name: t('potassium'), key: 'potassium', unit: t('mg'), color: 'bg-pink-500' },
      { name: t('calcium'), key: 'calcium', unit: t('mg'), color: 'bg-indigo-500' },
      { name: t('magnesium'), key: 'magnesium', unit: t('mg'), color: 'bg-teal-500' },
      { name: t('iron'), key: 'iron', unit: t('mg'), color: 'bg-red-500' },
      { name: t('zinc'), key: 'zinc', unit: t('mg'), color: 'bg-cyan-500' }
    ],
    vitamins: [
      { name: t('vitaminA'), key: 'vitaminA', unit: 'μg', color: 'bg-amber-500' },
      { name: t('vitaminC'), key: 'vitaminC', unit: t('mg'), color: 'bg-lime-500' },
      { name: t('vitaminD'), key: 'vitaminD', unit: 'μg', color: 'bg-emerald-500' },
      { name: t('vitaminE'), key: 'vitaminE', unit: t('mg'), color: 'bg-sky-500' },
      { name: t('vitaminK'), key: 'vitaminK', unit: 'μg', color: 'bg-violet-500' },
      { name: t('vitaminB1'), key: 'vitaminB1', unit: t('mg'), color: 'bg-fuchsia-500' },
      { name: t('vitaminB6'), key: 'vitaminB6', unit: t('mg'), color: 'bg-rose-500' },
      { name: t('vitaminB12'), key: 'vitaminB12', unit: 'μg', color: 'bg-blue-600' }
    ],
    others: [
      { name: t('cholesterol'), key: 'cholesterol', unit: t('mg'), color: 'bg-red-600' },
      { name: t('sugar'), key: 'sugar', unit: t('grams'), color: 'bg-pink-600' },
      { name: t('saturatedFat'), key: 'saturatedFat', unit: t('grams'), color: 'bg-orange-600' },
      { name: t('transFat'), key: 'transFat', unit: t('grams'), color: 'bg-yellow-600' },
      { name: t('omega3'), key: 'omega3', unit: t('grams'), color: 'bg-green-600' },
      { name: t('omega6'), key: 'omega6', unit: t('grams'), color: 'bg-teal-600' }
    ]
  };

  const NutrientProgress = ({ nutrient }: { nutrient: NutrientInfo }) => {
    const consumed = progress.consumed[nutrient.key] || 0;
    const limit = progress.limits[nutrient.key] || 100;
    const percentage = Math.min((consumed / limit) * 100, 100);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{nutrient.name}</span>
          <span className="text-sm text-gray-600">
            {formatNutritionValue(consumed, nutrient.unit)} / {formatNutritionValue(limit, nutrient.unit)}
          </span>
        </div>
        
        <div className="relative">
          <Progress value={consumed} max={limit} className="h-3" />
          <div 
            className={`absolute top-0 left-0 h-3 rounded-full transition-all ${nutrient.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {percentage >= 100 && (
          <div className="text-xs text-red-500 font-medium text-right">
            {formatNutritionValue(consumed - limit, nutrient.unit)} {t('over')}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('dailyProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['macros']} className="space-y-2">
          {Object.entries(categories).map(([key, nutrients]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-lg font-semibold">
                {t(key)}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-2">
                  {nutrients.map((nutrient) => (
                    <NutrientProgress key={nutrient.key} nutrient={nutrient} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
