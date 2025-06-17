'use client';

import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/components/AuthGuard';

export default function Home() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Vocrate</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user?.firstName || user?.username}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Vocrate
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your personal vocabulary learning companion
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-blue-600">0</h3>
                <p className="text-gray-600">Words Learned</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-green-600">0</h3>
                <p className="text-gray-600">Study Sessions</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-purple-600">0%</h3>
                <p className="text-gray-600">Average Mastery</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Add New Word
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Start Study Session
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                View All Words
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
