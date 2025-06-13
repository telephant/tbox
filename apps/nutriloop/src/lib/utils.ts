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
  const consumed = foodEntries.reduce(
    (total, entry) => ({
      calories: total.calories + entry.nutrition.calories,
      fat: total.fat + entry.nutrition.fat,
      protein: total.protein + entry.nutrition.protein,
      carbs: total.carbs + entry.nutrition.carbs,
    }),
    { calories: 0, fat: 0, protein: 0, carbs: 0 }
  );

  const percentage = {
    calories: Math.round((consumed.calories / limits.calories) * 100),
    fat: Math.round((consumed.fat / limits.fat) * 100),
    protein: Math.round((consumed.protein / limits.protein) * 100),
    carbs: Math.round((consumed.carbs / limits.carbs) * 100),
  };

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
  return `${value.toFixed(1)}g`;
}
