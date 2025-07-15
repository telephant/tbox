import { EditorCommand } from '../types';
import { EditorUtils } from '../utils/EditorUtils';

export class TextCommands {
  static bold: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('bold', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('bold')
  };

  static italic: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('italic', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('italic')
  };

  static underline: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('underline', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('underline')
  };

  static strikeThrough: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('strikeThrough', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('strikeThrough')
  };

  static fontName: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        doc.execCommand('fontName', false, value);
      }
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandValue('fontName')
  };

  static fontSize: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        // Convert px to font size number (1-7 scale for execCommand)
        const pxValue = parseInt(value);
        let sizeValue = '3'; // Default medium
        
        if (pxValue <= 10) sizeValue = '1';
        else if (pxValue <= 12) sizeValue = '2';
        else if (pxValue <= 16) sizeValue = '3';
        else if (pxValue <= 18) sizeValue = '4';
        else if (pxValue <= 24) sizeValue = '5';
        else if (pxValue <= 32) sizeValue = '6';
        else sizeValue = '7';
        
        doc.execCommand('fontSize', false, sizeValue);
        
        // Apply actual pixel size as inline style
        const selection = doc.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedElements = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? [range.commonAncestorContainer.parentElement]
            : Array.from(range.commonAncestorContainer.querySelectorAll('*'));
            
          selectedElements.forEach(el => {
            if (el && el instanceof HTMLElement) {
              EditorUtils.applyInlineStyle(el, 'fontSize', value);
            }
          });
        }
      }
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandValue('fontSize')
  };

  static foreColor: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        doc.execCommand('foreColor', false, value);
      }
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandValue('foreColor')
  };

  static backColor: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        doc.execCommand('backColor', false, value);
      }
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandValue('backColor')
  };
}

export class ParagraphCommands {
  static formatBlock: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        doc.execCommand('formatBlock', false, value);
      }
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandValue('formatBlock')
  };

  static justifyLeft: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('justifyLeft', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('justifyLeft')
  };

  static justifyCenter: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('justifyCenter', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('justifyCenter')
  };

  static justifyRight: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('justifyRight', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('justifyRight')
  };

  static justifyFull: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('justifyFull', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('justifyFull')
  };

  static lineHeight: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        const selection = doc.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const element = range.startContainer.nodeType === Node.TEXT_NODE 
            ? range.startContainer.parentElement 
            : range.startContainer as HTMLElement;
          
          if (element) {
            EditorUtils.applyInlineStyle(element, 'lineHeight', value);
          }
        }
      }
    },
    canExecute: () => true,
    getState: () => ''
  };

  static paragraphSpacing: EditorCommand = {
    execute: (doc: Document, value?: string) => {
      if (value) {
        const selection = doc.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const element = range.startContainer.nodeType === Node.TEXT_NODE 
            ? range.startContainer.parentElement 
            : range.startContainer as HTMLElement;
          
          if (element) {
            EditorUtils.applyInlineStyle(element, 'marginBottom', value);
          }
        }
      }
    },
    canExecute: () => true,
    getState: () => ''
  };
}

export class ListCommands {
  static insertUnorderedList: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('insertUnorderedList', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('insertUnorderedList')
  };

  static insertOrderedList: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('insertOrderedList', false);
    },
    canExecute: () => true,
    getState: (doc: Document) => doc.queryCommandState('insertOrderedList')
  };

  static indent: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('indent', false);
    },
    canExecute: () => true,
    getState: () => false
  };

  static outdent: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('outdent', false);
    },
    canExecute: () => true,
    getState: () => false
  };

  static insertHorizontalRule: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('insertHorizontalRule', false);
    },
    canExecute: () => true,
    getState: () => false
  };
}

export class UtilityCommands {
  static undo: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('undo', false);
    },
    canExecute: (doc: Document) => doc.queryCommandEnabled('undo'),
    getState: () => false
  };

  static redo: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('redo', false);
    },
    canExecute: (doc: Document) => doc.queryCommandEnabled('redo'),
    getState: () => false
  };

  static removeFormat: EditorCommand = {
    execute: (doc: Document) => {
      doc.execCommand('removeFormat', false);
    },
    canExecute: () => true,
    getState: () => false
  };
}

// Command registry for easy access
export const Commands = {
  // Text formatting
  bold: TextCommands.bold,
  italic: TextCommands.italic,
  underline: TextCommands.underline,
  strikeThrough: TextCommands.strikeThrough,
  fontName: TextCommands.fontName,
  fontSize: TextCommands.fontSize,
  foreColor: TextCommands.foreColor,
  backColor: TextCommands.backColor,
  
  // Paragraph formatting
  formatBlock: ParagraphCommands.formatBlock,
  justifyLeft: ParagraphCommands.justifyLeft,
  justifyCenter: ParagraphCommands.justifyCenter,
  justifyRight: ParagraphCommands.justifyRight,
  justifyFull: ParagraphCommands.justifyFull,
  lineHeight: ParagraphCommands.lineHeight,
  paragraphSpacing: ParagraphCommands.paragraphSpacing,
  
  // Lists
  insertUnorderedList: ListCommands.insertUnorderedList,
  insertOrderedList: ListCommands.insertOrderedList,
  indent: ListCommands.indent,
  outdent: ListCommands.outdent,
  insertHorizontalRule: ListCommands.insertHorizontalRule,
  
  // Utilities
  undo: UtilityCommands.undo,
  redo: UtilityCommands.redo,
  removeFormat: UtilityCommands.removeFormat
};