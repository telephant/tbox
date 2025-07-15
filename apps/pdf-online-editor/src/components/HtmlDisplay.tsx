'use client';

import { useState } from 'react';
import { ConversionResult } from '../services/pdfConverter';
import EditableHtmlViewer from './EditableHtmlViewer';

interface HtmlDisplayProps {
  result: ConversionResult;
  onBack: () => void;
}

export default function HtmlDisplay({ result, onBack }: HtmlDisplayProps) {
  // Always use editor - no preview mode
  return <EditableHtmlViewer result={result} onBack={onBack} />;

}