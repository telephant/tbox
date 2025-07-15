import { StyleProperties } from '../types';

export class InlineStyleConverter {
  private static readonly PDF_SAFE_FONTS = [
    'Arial', 'Times New Roman', 'Helvetica', 'Courier New', 'Georgia', 'Verdana'
  ];

  static convertToInlineStyles(html: string): string {
    // Create a temporary DOM to work with
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Process all elements
    this.processElement(doc.body);
    
    return doc.body.innerHTML;
  }

  private static processElement(element: HTMLElement): void {
    // Process all child elements recursively
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        this.processElement(child);
      }
    });

    // Convert this element's styles
    this.convertElementStyles(element);
  }

  private static convertElementStyles(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    const inlineStyles: StyleProperties = {};

    // Extract relevant styles
    const relevantProperties = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'textDecoration',
      'color', 'backgroundColor', 'textAlign', 'lineHeight', 'marginTop',
      'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom',
      'paddingLeft', 'paddingRight', 'borderWidth', 'borderStyle', 'borderColor'
    ];

    relevantProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(this.camelToKebab(prop));
      if (value && value !== 'initial' && value !== 'inherit') {
        inlineStyles[prop as keyof StyleProperties] = value;
      }
    });

    // Normalize styles for PDF
    const normalizedStyles = this.normalizeForPdf(inlineStyles);
    
    // Apply inline styles
    this.applyInlineStyles(element, normalizedStyles);
  }

  static normalizeForPdf(styles: StyleProperties): StyleProperties {
    const normalized: StyleProperties = {};

    // Font family normalization
    if (styles.fontFamily) {
      normalized.fontFamily = this.normalizeFontFamily(styles.fontFamily);
    }

    // Font size normalization
    if (styles.fontSize) {
      normalized.fontSize = this.normalizeFontSize(styles.fontSize);
    }

    // Font weight normalization
    if (styles.fontWeight) {
      normalized.fontWeight = this.normalizeFontWeight(styles.fontWeight);
    }

    // Color normalization
    if (styles.color) {
      normalized.color = this.normalizeColor(styles.color);
    }

    if (styles.backgroundColor) {
      normalized.backgroundColor = this.normalizeColor(styles.backgroundColor);
    }

    // Text alignment
    if (styles.textAlign) {
      normalized.textAlign = styles.textAlign;
    }

    // Line height normalization
    if (styles.lineHeight) {
      normalized.lineHeight = this.normalizeLineHeight(styles.lineHeight);
    }

    // Margin and padding normalization
    ['marginTop', 'marginBottom', 'marginLeft', 'marginRight',
     'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(prop => {
      if (styles[prop as keyof StyleProperties]) {
        normalized[prop as keyof StyleProperties] = this.normalizeUnit(styles[prop as keyof StyleProperties]!);
      }
    });

    // Text decoration
    if (styles.textDecoration) {
      normalized.textDecoration = styles.textDecoration;
    }

    // Font style
    if (styles.fontStyle) {
      normalized.fontStyle = styles.fontStyle;
    }

    return normalized;
  }

  private static normalizeFontFamily(fontFamily: string): string {
    // Extract first font from font stack
    const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
    
    // Find first PDF-safe font
    const safeFont = fonts.find(font => 
      this.PDF_SAFE_FONTS.some(safe => 
        font.toLowerCase().includes(safe.toLowerCase())
      )
    );

    return safeFont || 'Arial';
  }

  private static normalizeFontSize(fontSize: string): string {
    // Convert all font sizes to pixels
    const match = fontSize.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) return '14px';

    const [, value, unit] = match;
    const numValue = parseFloat(value);

    switch (unit) {
      case 'px':
        return `${numValue}px`;
      case 'pt':
        return `${Math.round(numValue * 1.33)}px`;
      case 'em':
        return `${Math.round(numValue * 16)}px`;
      case 'rem':
        return `${Math.round(numValue * 16)}px`;
      case '%':
        return `${Math.round(numValue * 0.16)}px`;
      default:
        return '14px';
    }
  }

  private static normalizeFontWeight(fontWeight: string): string {
    // Normalize font weights to numeric values
    const weightMap: { [key: string]: string } = {
      'normal': '400',
      'bold': '700',
      'bolder': '700',
      'lighter': '300',
      '100': '100',
      '200': '200',
      '300': '300',
      '400': '400',
      '500': '500',
      '600': '600',
      '700': '700',
      '800': '800',
      '900': '900'
    };

    return weightMap[fontWeight] || '400';
  }

  private static normalizeColor(color: string): string {
    // Convert colors to hex format
    if (color.startsWith('#')) {
      return color;
    }

    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
    }

    // Handle named colors
    const namedColors: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'green': '#008000',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'cyan': '#00ffff',
      'magenta': '#ff00ff',
      'gray': '#808080',
      'grey': '#808080',
      'transparent': 'transparent'
    };

    return namedColors[color.toLowerCase()] || color;
  }

  private static normalizeLineHeight(lineHeight: string): string {
    // Convert line heights to numeric values
    if (lineHeight === 'normal') {
      return '1.2';
    }

    const match = lineHeight.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) return '1.2';

    const [, value, unit] = match;
    const numValue = parseFloat(value);

    if (!unit || unit === '') {
      // Unitless line height
      return numValue.toString();
    }

    if (unit === 'px') {
      // Convert px to ratio (assuming 16px base font size)
      return (numValue / 16).toString();
    }

    if (unit === '%') {
      // Convert percentage to ratio
      return (numValue / 100).toString();
    }

    return '1.2';
  }

  private static normalizeUnit(value: string): string {
    // Convert all units to pixels
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) return '0px';

    const [, numValue, unit] = match;
    const num = parseFloat(numValue);

    switch (unit) {
      case 'px':
        return `${num}px`;
      case 'pt':
        return `${Math.round(num * 1.33)}px`;
      case 'em':
        return `${Math.round(num * 16)}px`;
      case 'rem':
        return `${Math.round(num * 16)}px`;
      case '%':
        return `${Math.round(num * 0.16)}px`;
      default:
        return `${num}px`;
    }
  }

  private static applyInlineStyles(element: HTMLElement, styles: StyleProperties): void {
    Object.entries(styles).forEach(([property, value]) => {
      if (value) {
        const cssProperty = this.camelToKebab(property);
        element.style.setProperty(cssProperty, value);
      }
    });
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static extractComputedStyles(element: HTMLElement): CSSStyleDeclaration {
    return window.getComputedStyle(element);
  }

  static mergeStyles(existing: string, additional: StyleProperties): string {
    const existingStyles = this.parseInlineStyles(existing);
    const merged = { ...existingStyles, ...additional };
    
    return Object.entries(merged)
      .filter(([, value]) => value)
      .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value}`)
      .join('; ');
  }

  private static parseInlineStyles(styleString: string): StyleProperties {
    const styles: StyleProperties = {};
    
    if (!styleString) return styles;
    
    const declarations = styleString.split(';');
    declarations.forEach(decl => {
      const [prop, value] = decl.split(':').map(s => s.trim());
      if (prop && value) {
        const camelProp = this.kebabToCamel(prop);
        styles[camelProp as keyof StyleProperties] = value;
      }
    });
    
    return styles;
  }

  private static kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}