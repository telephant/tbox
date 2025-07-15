export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  backgroundColor: string;
  alignment: string;
  heading: string;
  listType: string | null;
}

export interface RichTextEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
  onSelectionChange: (formats: ActiveFormats) => void;
  className?: string;
}

export interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
  activeFormats: ActiveFormats;
  disabled?: boolean;
}

export interface TextFormatToolbarProps extends ToolbarProps {
  currentFont: string;
  currentSize: string;
  currentColor: string;
  currentBackgroundColor: string;
}

export interface ParagraphToolbarProps extends ToolbarProps {
  currentAlignment: string;
  currentHeading: string;
}

export interface ListToolbarProps extends ToolbarProps {
  currentListType: string | null;
}

export interface UtilityToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClearFormat: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export interface EditorCommand {
  execute(editor: HTMLDocument, value?: string): void;
  canExecute(editor: HTMLDocument): boolean;
  getState(editor: HTMLDocument): string | boolean;
}

export interface StyleProperties {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: string;
  lineHeight?: string;
  marginTop?: string;
  marginBottom?: string;
  paddingLeft?: string;
  listStyleType?: string;
}

export interface InlineStyleConverter {
  convertToInlineStyles(html: string): string;
  extractComputedStyles(element: HTMLElement): CSSStyleDeclaration;
  normalizeForPdf(styles: StyleProperties): StyleProperties;
  mergeStyles(existing: string, additional: StyleProperties): string;
}

export type FontFamily = 'Arial' | 'Times New Roman' | 'Helvetica' | 'Courier New' | 'Georgia' | 'Verdana' | 'Times' | 'Courier';
export type FontSize = '8px' | '10px' | '12px' | '14px' | '16px' | '18px' | '20px' | '24px' | '28px' | '32px' | '36px' | '48px' | '72px';
export type Alignment = 'left' | 'center' | 'right' | 'justify';
export type HeadingLevel = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ListType = 'ul' | 'ol' | null;