'use client';

import React from 'react';
import { UtilityToolbarProps } from '../types';

export default function UtilityToolbar({
  onUndo,
  onRedo,
  onClearFormat,
  canUndo,
  canRedo,
  disabled = false
}: UtilityToolbarProps) {
  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
      {/* Undo */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className="px-2 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      {/* Redo */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRedo}
        disabled={disabled || !canRedo}
        className="px-2 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
        title="Redo (Ctrl+Y)"
      >
        ↷
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Clear Format */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClearFormat}
        disabled={disabled}
        className="px-2 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
        title="Clear Formatting"
      >
        Clear
      </button>
    </div>
  );
}