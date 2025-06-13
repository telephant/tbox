export interface NutritionInfo {
  calories: number;
  fat: number; // in grams
  protein: number; // in grams
  carbs: number; // in grams
}

export interface FoodEntry {
  id: string;
  name: string;
  weight: number; // in grams or ml
  unit: 'g' | 'ml';
  nutrition: NutritionInfo;
  date: string; // ISO date string
  createdAt: Date;
}

export interface DailyLimits {
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
}

export interface FoodCache {
  id: string;
  name: string;
  nutritionPer100g: NutritionInfo;
  lastUsed: Date;
}

export interface DailyProgress {
  consumed: NutritionInfo;
  limits: DailyLimits;
  percentage: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
  };
}
