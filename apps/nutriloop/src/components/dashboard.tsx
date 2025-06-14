'use client';

import { db } from '@/lib/db';
import { DailyLimits, DailyProgress, FoodEntry } from '@/lib/types';
import { calculateDailyProgress, formatDate, getTodayDateString } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DailyLimitsSettings } from './daily-limits';
import { FoodInput } from './food-input';
import { FoodLog } from './food-log';
import { LanguageSwitcher } from './language-switcher';
import { ProgressBars } from './progress-bars';

export function Dashboard() {
  // Always call hooks in the same order
  const { t } = useTranslation();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [currentLimits, setCurrentLimits] = useState<DailyLimits | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = getTodayDateString();
      const [entries, limits] = await Promise.all([
        db.getFoodEntriesByDate(today),
        db.getDailyLimits(),
      ]);

      // Ensure entries is always an array
      const safeEntries = Array.isArray(entries) ? entries : [];
      setFoodEntries(safeEntries);
      setCurrentLimits(limits);
      setDailyProgress(calculateDailyProgress(safeEntries, limits));
      setError(null);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please refresh the page.');
      // Set safe defaults
      setFoodEntries([]);
      setCurrentLimits(null);
      setDailyProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodAdded = () => {
    loadData();
  };

  const handleEntryDeleted = () => {
    loadData();
  };

  const handleLimitsUpdated = () => {
    loadData();
    setShowSettings(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                {t('appName')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {formatDate(getTodayDateString())}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Settings Toggle */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showSettings ? t('hideSettings') : t('showSettings')}
          </button>
        </div>

        <div className="space-y-6">
          {/* Settings Panel */}
          {showSettings && currentLimits && (
            <DailyLimitsSettings
              initialLimits={currentLimits}
              onLimitsUpdated={handleLimitsUpdated}
            />
          )}

          {/* Food Input */}
          <FoodInput onFoodAdded={handleFoodAdded} />

          {/* Progress Bars */}
          {dailyProgress && <ProgressBars progress={dailyProgress} />}

          {/* Food Log */}
          <FoodLog entries={foodEntries} onEntryDeleted={handleEntryDeleted} />
        </div>
      </div>
    </div>
  );
}
