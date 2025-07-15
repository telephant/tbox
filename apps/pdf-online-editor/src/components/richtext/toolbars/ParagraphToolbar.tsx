'use client';

import React from 'react';
import { ParagraphToolbarProps, Alignment, HeadingLevel } from '../types';

const HEADING_OPTIONS: { value: HeadingLevel; label: string }[] = [
  { value: 'p', label: 'Normal' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' }
];

const ALIGNMENT_OPTIONS: { value: Alignment; label: string; icon: string }[] = [
  { value: 'left', label: 'Align Left', icon: '⬅️' },
  { value: 'center', label: 'Align Center', icon: '➡️' },
  { value: 'right', label: 'Align Right', icon: '➡️' },
  { value: 'justify', label: 'Justify', icon: '⬄' }
];

export default function ParagraphToolbar({
  onFormat,
  currentAlignment,
  currentHeading,
  disabled = false
}: ParagraphToolbarProps) {
  const handleHeadingChange = (heading: HeadingLevel) => {
    if (heading === 'p') {
      onFormat('formatBlock', 'div');
    } else {
      onFormat('formatBlock', heading);
    }
  };

  const handleAlignmentChange = (alignment: Alignment) => {
    const alignmentCommands = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    onFormat(alignmentCommands[alignment]);
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
      {/* Heading Level */}
      <select
        value={currentHeading}
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => handleHeadingChange(e.target.value as HeadingLevel)}
        disabled={disabled}
        className="px-2 py-1 border border-slate-200 rounded text-sm bg-white disabled:opacity-50"
      >
        {HEADING_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}