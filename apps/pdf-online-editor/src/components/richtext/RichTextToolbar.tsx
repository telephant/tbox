'use client';

import React from 'react';
import { ActiveFormats } from './types';
import TextFormatToolbar from './toolbars/TextFormatToolbar';
import ParagraphToolbar from './toolbars/ParagraphToolbar';
import UtilityToolbar from './toolbars/UtilityToolbar';

interface RichTextToolbarProps {
  activeFormats: ActiveFormats;
  onFormat: (command: string, value?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearFormat: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export default function RichTextToolbar({
  activeFormats,
  onFormat,
  onUndo,
  onRedo,
  onClearFormat,
  canUndo,
  canRedo,
  disabled = false
}: RichTextToolbarProps) {
  return (
    <div className="border border-slate-200 rounded-t-lg overflow-hidden bg-white shadow-sm">
      {/* Main formatting toolbar */}
      <TextFormatToolbar
        onFormat={onFormat}
        activeFormats={activeFormats}
        currentFont={activeFormats.fontFamily}
        currentSize={activeFormats.fontSize}
        currentColor={activeFormats.textColor}
        currentBackgroundColor={activeFormats.backgroundColor}
        disabled={disabled}
      />

      {/* Paragraph and alignment toolbar */}
      <ParagraphToolbar
        onFormat={onFormat}
        activeFormats={activeFormats}
        currentAlignment={activeFormats.alignment}
        currentHeading={activeFormats.heading}
        disabled={disabled}
      />

      {/* Utility toolbar */}
      <UtilityToolbar
        onUndo={onUndo}
        onRedo={onRedo}
        onClearFormat={onClearFormat}
        canUndo={canUndo}
        canRedo={canRedo}
        disabled={disabled}
      />
    </div>
  );
}