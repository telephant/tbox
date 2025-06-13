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
  const { t } = useTranslation();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [currentLimits, setCurrentLimits] = useState<DailyLimits | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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

      setFoodEntries(entries);
      setCurrentLimits(limits);
      setDailyProgress(calculateDailyProgress(entries, limits));
    } catch (error) {
      console.error('Failed to load data:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
