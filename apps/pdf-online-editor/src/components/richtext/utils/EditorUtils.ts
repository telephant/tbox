import { ActiveFormats, StyleProperties } from '../types';

export class EditorUtils {
  static getActiveFormats(doc: Document): ActiveFormats {
    try {
      const selection = doc.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return this.getDefaultFormats();
      }

      const range = selection.getRangeAt(0);
      let element: HTMLElement | null = null;
      
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        element = range.startContainer.parentElement;
      } else if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        element = range.startContainer as HTMLElement;
      }

      if (!element || !(element instanceof HTMLElement)) {
        return this.getDefaultFormats();
      }

      const computedStyle = doc.defaultView?.getComputedStyle(element);
      
      return {
        bold: doc.queryCommandState('bold') || this.isBold(computedStyle),
        italic: doc.queryCommandState('italic') || this.isItalic(computedStyle),
        underline: doc.queryCommandState('underline') || this.isUnderlined(computedStyle),
        strikethrough: doc.queryCommandState('strikeThrough') || this.isStrikethrough(computedStyle),
        fontFamily: this.getFontFamily(computedStyle) || 'Arial',
        fontSize: this.getFontSize(computedStyle) || '14px',
        textColor: this.getTextColor(computedStyle) || '#000000',
        backgroundColor: this.getBackgroundColor(computedStyle) || '#ffffff',
        alignment: this.getAlignment(element) || 'left',
        heading: this.getHeading(element) || 'p',
        listType: this.getListType(element)
      };
    } catch (error) {
      console.warn('Error getting active formats:', error);
      return this.getDefaultFormats();
    }
  }

  static getDefaultFormats(): ActiveFormats {
    return {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontFamily: 'Arial',
      fontSize: '14px',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      alignment: 'left',
      heading: 'p',
      listType: null
    };
  }

  private static isBold(style: CSSStyleDeclaration | undefined): boolean {
    if (!style) return false;
    const fontWeight = style.fontWeight;
    return fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700;
  }

  private static isItalic(style: CSSStyleDeclaration | undefined): boolean {
    return style?.fontStyle === 'italic';
  }

  private static isUnderlined(style: CSSStyleDeclaration | undefined): boolean {
    return style?.textDecoration?.includes('underline') || false;
  }

  private static isStrikethrough(style: CSSStyleDeclaration | undefined): boolean {
    return style?.textDecoration?.includes('line-through') || false;
  }

  private static getFontFamily(style: CSSStyleDeclaration | undefined): string {
    if (!style) return 'Arial';
    const fontFamily = style.fontFamily;
    // Extract first font family from the CSS font stack
    const firstFont = fontFamily.split(',')[0].trim().replace(/["']/g, '');
    return firstFont || 'Arial';
  }

  private static getFontSize(style: CSSStyleDeclaration | undefined): string {
    if (!style) return '14px';
    const fontSize = style.fontSize;
    // Convert to px if needed
    if (fontSize.endsWith('px')) {
      return fontSize;
    }
    // Convert other units to px (simplified)
    const numericValue = parseFloat(fontSize);
    if (fontSize.endsWith('pt')) {
      return `${Math.round(numericValue * 1.33)}px`;
    }
    if (fontSize.endsWith('em') || fontSize.endsWith('rem')) {
      return `${Math.round(numericValue * 16)}px`;
    }
    return '14px';
  }

  private static getTextColor(style: CSSStyleDeclaration | undefined): string {
    if (!style) return '#000000';
    const color = style.color;
    return this.rgbToHex(color) || '#000000';
  }

  private static getBackgroundColor(style: CSSStyleDeclaration | undefined): string {
    if (!style) return '#ffffff';
    const bgColor = style.backgroundColor;
    return this.rgbToHex(bgColor) || '#ffffff';
  }

  private static getAlignment(element: HTMLElement): string {
    try {
      const style = element.style.textAlign;
      if (style) return style;
      
      const computedStyle = element.ownerDocument?.defaultView?.getComputedStyle(element);
      return computedStyle?.textAlign || 'left';
    } catch {
      return 'left';
    }
  }

  private static getHeading(element: HTMLElement): string {
    let current = element;
    while (current && current.tagName) {
      const tagName = current.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        return tagName;
      }
      current = current.parentElement!;
    }
    return 'p';
  }

  private static getListType(element: HTMLElement): string | null {
    let current = element;
    while (current && current.tagName) {
      const tagName = current.tagName.toLowerCase();
      if (tagName === 'ul') return 'ul';
      if (tagName === 'ol') return 'ol';
      current = current.parentElement!;
    }
    return null;
  }

  private static rgbToHex(rgb: string): string | null {
    if (!rgb) return null;
    
    // Handle hex colors
    if (rgb.startsWith('#')) {
      return rgb;
    }
    
    // Handle rgb/rgba colors
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match;
      return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
    }
    
    // Handle named colors (simplified)
    const namedColors: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'green': '#008000',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'cyan': '#00ffff',
      'magenta': '#ff00ff',
      'transparent': '#ffffff'
    };
    
    return namedColors[rgb.toLowerCase()] || null;
  }

  static applyInlineStyle(element: HTMLElement, property: string, value: string): void {
    if (!element.style) return;
    
    const styleMap: { [key: string]: string } = {
      'fontFamily': 'font-family',
      'fontSize': 'font-size',
      'fontWeight': 'font-weight',
      'fontStyle': 'font-style',
      'textDecoration': 'text-decoration',
      'color': 'color',
      'backgroundColor': 'background-color',
      'textAlign': 'text-align',
      'lineHeight': 'line-height'
    };
    
    const cssProperty = styleMap[property] || property;
    element.style.setProperty(cssProperty, value);
  }

  static mergeInlineStyles(element: HTMLElement, styles: StyleProperties): void {
    Object.entries(styles).forEach(([key, value]) => {
      if (value) {
        this.applyInlineStyle(element, key, value);
      }
    });
  }

  static wrapSelectionWithInlineStyle(doc: Document, styles: StyleProperties): void {
    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = doc.createElement('span');
    this.mergeInlineStyles(span, styles);
    
    try {
      range.surroundContents(span);
    } catch {
      // If can't surround (e.g., range spans multiple elements), extract and wrap
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
    
    // Clear selection
    selection.removeAllRanges();
    
    // Place cursor after the styled text
    range.selectNodeContents(span);
    range.collapse(false);
    selection.addRange(range);
  }
}