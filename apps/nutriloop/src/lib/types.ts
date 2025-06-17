export interface NutritionInfo {
  // Macros
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  
  // Minerals
  sodium: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  iron: number;
  zinc: number;
  
  // Vitamins
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  vitaminB1: number;
  vitaminB6: number;
  vitaminB12: number;
  
  // Others
  cholesterol: number;
  sugar: number;
  saturatedFat: number;
  transFat: number;
  omega3: number;
  omega6: number;
}

export type Unit = 'g' | 'ml' | 'piece';

export interface FoodEntry {
  id: string;
  name: string;
  weight: number; // in grams or ml
  unit: Unit;
  nutrition: NutritionInfo;
  date: string; // ISO date string
  createdAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DailyLimits extends NutritionInfo {}

export interface DailyProgress {
  consumed: NutritionInfo;
  limits: DailyLimits;
  percentage: NutritionInfo;
}
