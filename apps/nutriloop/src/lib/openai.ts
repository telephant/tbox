import OpenAI from 'openai';
import { NutritionInfo } from './types';
import { db } from './db';

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

  async getNutritionInfo(foodName: string, weight: number, unit: 'g' | 'ml'): Promise<NutritionInfo> {
    // Create cache key that includes unit for more accurate caching
    const cacheKey = `${foodName.toLowerCase()}_${unit}`;

    // First check cache
    const cached = await db.getCachedFood(cacheKey);
    if (cached) {
      return this.calculateNutritionForWeight(cached.nutritionPer100g, weight);
    }

    // If not cached, get from OpenAI
    const nutritionPer100g = await this.fetchNutritionFromOpenAI(foodName, unit);

    // Cache the result with unit-specific key
    await db.cacheFood({
      name: cacheKey,
      nutritionPer100g,
    });

    return this.calculateNutritionForWeight(nutritionPer100g, weight);
  }

  private async fetchNutritionFromOpenAI(foodName: string, unit: 'g' | 'ml'): Promise<NutritionInfo> {
    const openai = this.initOpenAI();

    const unitText = unit === 'g' ? 'grams' : 'milliliters';
    const unitContext = unit === 'ml' ?
      ' (Note: This is a liquid, so consider density and liquid-specific nutritional properties)' :
      ' (Note: This is a solid food)';

    const prompt = `
Please provide the nutritional information for "${foodName}" per 100 ${unitText}${unitContext}.
Return ONLY a JSON object with the following structure (no additional text):
{
  "calories": number,
  "fat": number,
  "protein": number,
  "carbs": number
}

Where:
- calories: total calories per 100${unit}
- fat: total fat in grams per 100${unit}
- protein: total protein in grams per 100${unit}
- carbs: total carbohydrates in grams per 100${unit}

Use standard nutritional values for common foods. If the food is not recognized, provide reasonable estimates based on similar foods.
For liquids (ml), consider the actual density and nutritional content per volume.
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
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const nutrition = JSON.parse(content) as NutritionInfo;
      
      // Validate the response
      if (
        typeof nutrition.calories !== 'number' ||
        typeof nutrition.fat !== 'number' ||
        typeof nutrition.protein !== 'number' ||
        typeof nutrition.carbs !== 'number'
      ) {
        throw new Error('Invalid nutrition data format');
      }

      return nutrition;
    } catch (error) {
      console.error('Error fetching nutrition from OpenAI:', error);
      // Fallback to default values
      return {
        calories: 100,
        fat: 1,
        protein: 5,
        carbs: 20,
      };
    }
  }

  private calculateNutritionForWeight(nutritionPer100g: NutritionInfo, weight: number): NutritionInfo {
    const factor = weight / 100;
    return {
      calories: Math.round(nutritionPer100g.calories * factor),
      fat: Math.round(nutritionPer100g.fat * factor * 10) / 10,
      protein: Math.round(nutritionPer100g.protein * factor * 10) / 10,
      carbs: Math.round(nutritionPer100g.carbs * factor * 10) / 10,
    };
  }
}

export const nutritionService = new NutritionService();
