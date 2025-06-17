import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FoodEntry, DailyLimits, DailyProgress, NutritionInfo } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateDailyProgress(
  foodEntries: FoodEntry[],
  limits: DailyLimits
): DailyProgress {
  // Initialize consumed with all nutrients set to 0
  const initialConsumed: NutritionInfo = {
    // Macros
    calories: 0,
    fat: 0,
    protein: 0,
    carbs: 0,
    
    // Minerals
    sodium: 0,
    potassium: 0,
    calcium: 0,
    magnesium: 0,
    iron: 0,
    zinc: 0,
    
    // Vitamins
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminB1: 0,
    vitaminB6: 0,
    vitaminB12: 0,
    
    // Others
    cholesterol: 0,
    sugar: 0,
    saturatedFat: 0,
    transFat: 0,
    omega3: 0,
    omega6: 0
  };

  // Sum up all nutrients from food entries
  const consumed = foodEntries.reduce((total, entry) => {
    const nutrition = entry.nutrition;
    return Object.keys(total).reduce((acc, key) => {
      const nutrientKey = key as keyof NutritionInfo;
      acc[nutrientKey] = total[nutrientKey] + (nutrition[nutrientKey] || 0);
      return acc;
    }, { ...total });
  }, initialConsumed);

  // Calculate percentage for all nutrients
  const percentage = Object.keys(consumed).reduce((acc, key) => {
    const nutrientKey = key as keyof NutritionInfo;
    acc[nutrientKey] = Math.round((consumed[nutrientKey] / (limits[nutrientKey] || 1)) * 100);
    return acc;
  }, { ...initialConsumed });

  return {
    consumed,
    limits,
    percentage,
  };
}

export function getProgressColor(percentage: number): string {
  if (percentage < 50) return 'bg-green-500';
  if (percentage < 80) return 'bg-yellow-500';
  if (percentage < 100) return 'bg-orange-500';
  return 'bg-red-500';
}

export function formatNutritionValue(value: number, unit: string): string {
  if (unit === 'kcal') {
    return `${Math.round(value)} ${unit}`;
  }
  if (unit === 'μg' || unit === 'mg') {
    return `${value.toFixed(1)} ${unit}`;
  }
  return `${value.toFixed(1)}${unit}`;
}
