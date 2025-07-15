'use client';

import React from 'react';
import { TextFormatToolbarProps, FontFamily, FontSize } from '../types';

const FONT_FAMILIES: FontFamily[] = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Courier New',
  'Georgia',
  'Verdana',
  'Times',
  'Courier'
];

const FONT_SIZES: FontSize[] = [
  '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'
];

const COMMON_COLORS = [
  '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F3F3F3', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
  '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#D9D2E9', '#EAD1DC',
  '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#B4A7D6', '#D5A6BD',
  '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3D85C6', '#674EA7', '#A64D79',
  '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#351C75', '#741B47',
  '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#20124D', '#4C1130'
];

export default function TextFormatToolbar({
  onFormat,
  activeFormats,
  currentFont,
  currentSize,
  currentColor,
  currentBackgroundColor,
  disabled = false
}: TextFormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = React.useState(false);
  const [colorPickerType, setColorPickerType] = React.useState<'text' | 'background'>('text');

  const handleColorSelect = (color: string) => {
    if (colorPickerType === 'text') {
      onFormat('foreColor', color);
    } else {
      onFormat('backColor', color);
    }
    setShowColorPicker(false);
    setShowBackgroundColorPicker(false);
  };

  const ColorPicker = ({ onSelect, currentColor }: { onSelect: (color: string) => void; currentColor: string }) => (
    <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3 mt-1">
      <div className="grid grid-cols-8 gap-1 mb-2">
        {COMMON_COLORS.map((color) => (
          <button
            key={color}
            onMouseDown={(e) => e.preventDefault()}
            className={`w-6 h-6 rounded border-2 ${
              currentColor === color ? 'border-blue-500' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
            title={color}
          />
        ))}
      </div>
      <div className="border-t pt-2">
        <input
          type="color"
          value={currentColor}
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-8 border border-gray-300 rounded"
        />
      </div>
    </div>
  );

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
      {/* Font Family */}
      <select
        value={currentFont}
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => onFormat('fontName', e.target.value)}
        disabled={disabled}
        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50 cursor-pointer"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>

      {/* Font Size */}
      <select
        value={currentSize}
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => onFormat('fontSize', e.target.value)}
        disabled={disabled}
        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50 cursor-pointer"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Bold */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('bold')}
        disabled={disabled}
        className={`px-2 py-1 rounded text-sm font-bold transition-colors ${
          activeFormats.bold
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border border-gray-300 disabled:opacity-50`}
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('italic')}
        disabled={disabled}
        className={`px-2 py-1 rounded text-sm italic transition-colors ${
          activeFormats.italic
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border border-gray-300 disabled:opacity-50`}
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      {/* Underline */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('underline')}
        disabled={disabled}
        className={`px-2 py-1 rounded text-sm underline transition-colors ${
          activeFormats.underline
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border border-gray-300 disabled:opacity-50`}
        title="Underline (Ctrl+U)"
      >
        U
      </button>

      {/* Strikethrough */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('strikeThrough')}
        disabled={disabled}
        className={`px-2 py-1 rounded text-sm line-through transition-colors ${
          activeFormats.strikethrough
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border border-gray-300 disabled:opacity-50`}
        title="Strikethrough"
      >
        S
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Text Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setColorPickerType('text');
            setShowColorPicker(!showColorPicker);
            setShowBackgroundColorPicker(false);
          }}
          disabled={disabled}
          className="px-2 py-1 rounded text-sm border border-gray-300 bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-1"
          title="Text Color"
        >
          <span>A</span>
          <div
            className="w-4 h-1 border border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
        </button>
        {showColorPicker && colorPickerType === 'text' && (
          <ColorPicker onSelect={handleColorSelect} currentColor={currentColor} />
        )}
      </div>

      {/* Background Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setColorPickerType('background');
            setShowBackgroundColorPicker(!showBackgroundColorPicker);
            setShowColorPicker(false);
          }}
          disabled={disabled}
          className="px-2 py-1 rounded text-sm border border-gray-300 bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-1"
          title="Background Color"
        >
          <span className="text-xs">🎨</span>
          <div
            className="w-4 h-1 border border-gray-300"
            style={{ backgroundColor: currentBackgroundColor }}
          />
        </button>
        {showBackgroundColorPicker && colorPickerType === 'background' && (
          <ColorPicker onSelect={handleColorSelect} currentColor={currentBackgroundColor} />
        )}
      </div>
    </div>
  );
}