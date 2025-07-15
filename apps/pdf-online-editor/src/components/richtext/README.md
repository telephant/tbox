# Rich Text Editor

A powerful WYSIWYG rich text editor component built with React and TypeScript, optimized for PDF generation with inline styles.

## Features

- **Full WYSIWYG editing** with real-time formatting
- **Comprehensive toolbar** with text formatting, paragraph options, and utilities
- **Inline style generation** for perfect PDF export compatibility
- **Modular architecture** for easy extension
- **Keyboard shortcuts** for common operations
- **Undo/Redo support** with proper state management

## Components

### Core Components

- **RichTextEditor** - Main editor component with iframe-based editing
- **RichTextToolbar** - Complete toolbar with all formatting options
- **InlineStyleConverter** - Utility for converting styles to inline format

### Toolbar Components

- **TextFormatToolbar** - Bold, italic, underline, fonts, colors
- **ParagraphToolbar** - Headings, alignment, line height
- **ListToolbar** - Bulleted/numbered lists, indent/outdent
- **UtilityToolbar** - Undo/redo, clear formatting

### Utilities

- **EditorUtils** - Helper functions for formatting and selection
- **Commands** - Command system for all editor operations

## Usage

```tsx
import { RichTextEditor } from './components/richtext';

function MyComponent() {
  const [html, setHtml] = useState('<p>Initial content</p>');
  
  const handleChange = (newHtml: string) => {
    setHtml(newHtml);
  };
  
  const handleSelectionChange = (formats: ActiveFormats) => {
    // Handle selection change for toolbar state
  };
  
  return (
    <RichTextEditor
      initialHtml={html}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
    />
  );
}
```

## Inline Style Conversion

The editor generates HTML with inline styles, perfect for PDF generation:

```tsx
import { InlineStyleConverter } from './components/richtext';

// Convert CSS classes to inline styles
const inlineHtml = InlineStyleConverter.convertToInlineStyles(html);

// This HTML is ready for PDF export with all styles inline
```

## Features in Detail

### Text Formatting
- Bold, italic, underline, strikethrough
- Font family selection (PDF-safe fonts)
- Font size (8px - 72px)
- Text color with color picker
- Background color highlighting

### Paragraph Formatting
- Heading levels (H1-H6)
- Text alignment (left, center, right, justify)
- Line height control
- Paragraph spacing

### Lists and Structure
- Bulleted lists
- Numbered lists
- Indent/outdent controls
- Horizontal rule insertion

### Utilities
- Undo/redo with proper state tracking
- Clear formatting
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

## Integration with PDF Export

The rich text editor is designed to work seamlessly with PDF generation:

1. **All styles are inline** - No external CSS dependencies
2. **PDF-safe fonts** - Uses fonts that render consistently in PDFs
3. **Normalized units** - All measurements converted to pixels
4. **Color normalization** - All colors converted to hex format

## Architecture

The editor uses a command-based architecture:

- **Commands** - Each formatting operation is a command
- **State Management** - Tracks active formats and editor state
- **Event Handling** - Responds to user interactions and selections
- **Style Conversion** - Converts all styles to inline format

## Browser Support

- Modern browsers with contentEditable support
- iframe-based editing for security and isolation
- Full keyboard and mouse interaction support

## Extending the Editor

The modular design makes it easy to add new features:

1. **Add new commands** in the `commands/` directory
2. **Create new toolbar components** in the `toolbars/` directory
3. **Extend the style converter** for new CSS properties
4. **Add new formatting options** to the type definitions

## Performance

- Direct DOM manipulation for responsive editing
- Efficient event handling with debouncing
- Minimal re-renders with proper state management
- Optimized for documents of any size