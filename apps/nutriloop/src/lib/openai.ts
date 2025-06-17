import OpenAI from 'openai';
import { NutritionInfo } from './types';
import { Unit } from './types';

const UNIT_TO_TEXT = {
  one: {
    g: 'gram',
    ml: 'milliliter',
    piece: 'piece',
  },
  many: {
    g: 'grams',
    ml: 'milliliters',
    piece: 'pieces',
  },
};

class NutritionService {
  private openai: OpenAI | null = null;

  private initOpenAI() {
    if (!this.openai) {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const baseURL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL;

      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
      }

      if (!baseURL) {
        throw new Error('OpenAI base URL not found. Please set NEXT_PUBLIC_OPENAI_BASE_URL environment variable.');
      }

      this.openai = new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true,
      });
    }
    return this.openai;
  }

  async getNutritionInfo(foodName: string, weight: number, unit: Unit): Promise<NutritionInfo> {
    // For 'piece' unit, we want to get nutrition for the exact number of pieces
    // For 'g' and 'ml' units, we get per 100 units and then scale
    const baseWeight = unit === 'piece' ? weight : 100;
    
    // Get nutrition info from OpenAI for the base weight
    const nutrition = await this.fetchNutritionFromOpenAI(foodName, unit, baseWeight);
    
    // Only scale if we're using g or ml units
    if (unit !== 'piece') {
      return this.calculateNutritionForWeight(nutrition, weight);
    }
    
    return nutrition;
  }

  private async fetchNutritionFromOpenAI(foodName: string, unit: Unit, weight: number): Promise<NutritionInfo> {
    const openai = this.initOpenAI();

    const unitText = weight === 1 ? UNIT_TO_TEXT.one[unit] : UNIT_TO_TEXT.many[unit];
    const unitContext = unit === 'ml' ?
      ' (Note: This is a liquid, so consider density and liquid-specific nutritional properties)' :
      unit === 'piece' ? 
      ' (Note: Please provide nutrition for the exact number of pieces)' :
      ' (Note: This is a solid food)';

    const prompt = `
Please provide detailed nutritional information for "${foodName}" ${weight} ${unitText}${unitContext}.
Return ONLY a JSON object with the following structure (no additional text):
{
  // Macros
  "calories": number,  // in kcal
  "fat": number,      // in grams
  "protein": number,  // in grams
  "carbs": number,    // in grams
  
  // Minerals
  "sodium": number,    // in mg
  "potassium": number, // in mg
  "calcium": number,   // in mg
  "magnesium": number, // in mg
  "iron": number,      // in mg
  "zinc": number,      // in mg
  
  // Vitamins
  "vitaminA": number,   // in μg
  "vitaminC": number,   // in mg
  "vitaminD": number,   // in μg
  "vitaminE": number,   // in mg
  "vitaminK": number,   // in μg
  "vitaminB1": number,  // in mg
  "vitaminB6": number,  // in mg
  "vitaminB12": number, // in μg
  
  // Others
  "cholesterol": number,  // in mg
  "sugar": number,       // in grams
  "saturatedFat": number, // in grams
  "transFat": number,    // in grams
  "omega3": number,      // in grams
  "omega6": number       // in grams
}

Use standard nutritional values for common foods. If the food is not recognized, provide reasonable estimates based on similar foods.
For liquids (ml), consider the actual density and nutritional content per volume.
For pieces, provide nutrition values for the exact number of pieces specified.
For solids (g), use standard weight-based nutritional values.
`;

    try {
      const model = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const nutrition = JSON.parse(content) as NutritionInfo;
      
      // Validate the response has all required fields
      const requiredFields = Object.keys(this.getDefaultNutrition());
      const missingFields = requiredFields.filter(field => typeof nutrition[field as keyof NutritionInfo] !== 'number');
      
      if (missingFields.length > 0) {
        console.warn('Missing nutrition fields:', missingFields);
        // Fill in missing fields with defaults
        const defaults = this.getDefaultNutrition();
        missingFields.forEach(field => {
          nutrition[field as keyof NutritionInfo] = defaults[field as keyof NutritionInfo];
        });
      }

      return nutrition;
    } catch (error) {
      console.error('Error fetching nutrition from OpenAI:', error);
      return this.getDefaultNutrition();
    }
  }

  private calculateNutritionForWeight(nutritionPer100g: NutritionInfo, weight: number): NutritionInfo {
    const factor = weight / 100;
    return Object.keys(nutritionPer100g).reduce((acc, key) => {
      const nutrientKey = key as keyof NutritionInfo;
      const value = nutritionPer100g[nutrientKey] * factor;
      acc[nutrientKey] = key === 'calories' ? Math.round(value) : Math.round(value * 10) / 10;
      return acc;
    }, {} as NutritionInfo);
  }

  private getDefaultNutrition(): NutritionInfo {
    return {
      // Macros
      calories: 100,
      fat: 1,
      protein: 5,
      carbs: 20,
      
      // Minerals
      sodium: 50,
      potassium: 100,
      calcium: 20,
      magnesium: 10,
      iron: 1,
      zinc: 1,
      
      // Vitamins
      vitaminA: 50,
      vitaminC: 5,
      vitaminD: 1,
      vitaminE: 1,
      vitaminK: 5,
      vitaminB1: 0.1,
      vitaminB6: 0.1,
      vitaminB12: 0.2,
      
      // Others
      cholesterol: 5,
      sugar: 5,
      saturatedFat: 0.5,
      transFat: 0,
      omega3: 0.1,
      omega6: 0.5
    };
  }
}

export const nutritionService = new NutritionService();
