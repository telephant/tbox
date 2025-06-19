import { openDB, DBSchema, IDBPDatabase, deleteDB } from 'idb';
import { FoodEntry, DailyLimits } from './types';
import { DB_VERSION, DEFAULT_NUTRITION_LIMITS } from '@/contants';

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

    this.db = await openDB<NutriLoopDB>('nutriloop-db-2', 1, {
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
      return {
        ...DEFAULT_NUTRITION_LIMITS,
        ...limits,
      };
    }
    return DEFAULT_NUTRITION_LIMITS;
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
