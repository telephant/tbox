import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FoodEntry, DailyLimits } from './types';

interface DailyLimitsRecord extends DailyLimits {
  id: string;
}

interface NutriLoopDB extends DBSchema {
  foodEntries: {
    key: string;
    value: FoodEntry;
    indexes: { 'by-date': string };
  };
  dailyLimits: {
    key: string;
    value: DailyLimitsRecord;
  };
}

class DatabaseService {
  private db: IDBPDatabase<NutriLoopDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<NutriLoopDB>('nutriloop-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // Food entries store
          const foodStore = db.createObjectStore('foodEntries', {
            keyPath: 'id',
          });
          foodStore.createIndex('by-date', 'date');

          // Daily limits store
          db.createObjectStore('dailyLimits', {
            keyPath: 'id',
          });
        }

        if (oldVersion < 2) {
          // Migration for adding unit field to existing food entries
          // This will be handled at runtime when reading entries
        }
      },
    });
  }

  async addFoodEntry(entry: Omit<FoodEntry, 'id' | 'createdAt'>): Promise<FoodEntry> {
    await this.init();
    const foodEntry: FoodEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    await this.db!.add('foodEntries', foodEntry);
    return foodEntry;
  }

  async getFoodEntriesByDate(date: string): Promise<FoodEntry[]> {
    await this.init();
    const entries = await this.db!.getAllFromIndex('foodEntries', 'by-date', date);

    // Migrate old entries without unit field
    return entries.map(entry => {
      if (!entry.unit) {
        return { ...entry, unit: 'g' as const };
      }
      return entry;
    });
  }

  async deleteFoodEntry(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('foodEntries', id);
  }

  async getDailyLimits(): Promise<DailyLimits> {
    await this.init();
    const record = await this.db!.get('dailyLimits', 'default');
    if (record) {
      // Extract only the DailyLimits fields, excluding the id
      const { ...limits } = record;
      return limits;
    }
    return {
      // Macros
      calories: 2000,
      fat: 65,
      protein: 150,
      carbs: 250,
      
      // Minerals (based on general RDI)
      sodium: 2300,
      potassium: 3500,
      calcium: 1000,
      magnesium: 400,
      iron: 18,
      zinc: 15,
      
      // Vitamins (based on general RDI)
      vitaminA: 900,
      vitaminC: 90,
      vitaminD: 20,
      vitaminE: 15,
      vitaminK: 120,
      vitaminB1: 1.2,
      vitaminB6: 1.7,
      vitaminB12: 2.4,
      
      // Others
      cholesterol: 300,
      sugar: 50,
      saturatedFat: 20,
      transFat: 2,
      omega3: 1.6,
      omega6: 17
    };
  }

  async setDailyLimits(limits: DailyLimits): Promise<void> {
    await this.init();
    const record: DailyLimitsRecord = { ...limits, id: 'default' };
    await this.db!.put('dailyLimits', record);
  }

  async getAllFoodEntries(): Promise<FoodEntry[]> {
    await this.init();
    const entries = await this.db!.getAll('foodEntries');

    // Migrate old entries without unit field
    return entries.map(entry => {
      if (!entry.unit) {
        return { ...entry, unit: 'g' as const };
      }
      return entry;
    });
  }
}

export const db = new DatabaseService();
