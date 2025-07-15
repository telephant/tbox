'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RichTextEditorProps, ActiveFormats } from './types';
import { EditorUtils } from './utils/EditorUtils';
import RichTextToolbar from './RichTextToolbar';

const RichTextEditor = React.memo(function RichTextEditor({
  initialHtml,
  onChange,
  onSelectionChange,
  className = ''
}: RichTextEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EditorUtils.getDefaultFormats());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const contentRef = useRef<string>(initialHtml);
  const initializationRef = useRef<boolean>(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define callback functions first
  const updateCommandStates = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    try {
      setCanUndo(doc.queryCommandEnabled('undo'));
      setCanRedo(doc.queryCommandEnabled('redo'));
    } catch (error) {
      console.warn('Error updating command states:', error);
    }
  }, []);

  const updateActiveFormats = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !isReady) return;

    try {
      const doc = iframe.contentDocument;
      const formats = {
        bold: doc.queryCommandState('bold'),
        italic: doc.queryCommandState('italic'),
        underline: doc.queryCommandState('underline'),
        strikethrough: doc.queryCommandState('strikeThrough'),
        fontFamily: doc.queryCommandValue('fontName') || 'Arial',
        fontSize: doc.queryCommandValue('fontSize') || '14px',
        textColor: doc.queryCommandValue('foreColor') || '#000000',
        backgroundColor: doc.queryCommandValue('backColor') || '#ffffff',
        alignment: 'left', // Simplified for now
        heading: 'p', // Simplified for now
        listType: null as string | null // Simplified for now
      };
      
      setActiveFormats(formats);
      onSelectionChange(formats);
    } catch (error) {
      console.error('Error updating active formats:', error);
      setActiveFormats(EditorUtils.getDefaultFormats());
    }
  }, [onSelectionChange, isReady]);

  const handleContentChange = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !isReady) return;

    const newContent = iframe.contentDocument.body.innerHTML;
    if (newContent !== contentRef.current) {
      contentRef.current = newContent;
      onChange(newContent);
      updateCommandStates();
    }
  }, [onChange, updateCommandStates, isReady]);

  const handleSelectionChange = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const executeCommand = useCallback((command: string, value?: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !isReady || !initializationRef.current) {
      console.log('Cannot execute command: iframe or document not ready');
      return;
    }

    const doc = iframe.contentDocument;
    
    console.log('Executing command:', command, 'with value:', value);
    
    // Save current selection before command execution
    const selection = doc.getSelection();
    let savedRange: Range | null = null;
    
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
    
    // Focus the iframe body first
    if (doc.body) {
      doc.body.focus();
    }
    
    // Restore selection if it was saved
    if (savedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
    
    // Execute the command directly using execCommand
    let result = false;
    
    try {
      switch (command) {
        case 'bold':
          result = doc.execCommand('bold', false);
          break;
        case 'italic':
          result = doc.execCommand('italic', false);
          break;
        case 'underline':
          result = doc.execCommand('underline', false);
          break;
        case 'strikeThrough':
          result = doc.execCommand('strikeThrough', false);
          break;
        case 'fontName':
          result = doc.execCommand('fontName', false, value);
          break;
        case 'fontSize':
          // For font size, we need to use a different approach
          // execCommand fontSize uses 1-7 scale, but we want pixel values
          result = doc.execCommand('fontSize', false, '3'); // Use size 3 as base
          // Then apply the actual size via styleWithCSS
          if (result && value) {
            const selection = doc.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const span = doc.createElement('span');
              span.style.fontSize = value;
              try {
                range.surroundContents(span);
                result = true;
              } catch (e) {
                // If surroundContents fails, try extractContents and appendChild
                try {
                  span.appendChild(range.extractContents());
                  range.insertNode(span);
                  result = true;
                } catch (e2) {
                  console.warn('Font size application failed:', e2);
                }
              }
            }
          }
          break;
        case 'foreColor':
          result = doc.execCommand('foreColor', false, value);
          break;
        case 'backColor':
          result = doc.execCommand('backColor', false, value);
          break;
        case 'justifyLeft':
          result = doc.execCommand('justifyLeft', false);
          break;
        case 'justifyCenter':
          result = doc.execCommand('justifyCenter', false);
          break;
        case 'justifyRight':
          result = doc.execCommand('justifyRight', false);
          break;
        case 'justifyFull':
          result = doc.execCommand('justifyFull', false);
          break;
        case 'insertUnorderedList':
          result = doc.execCommand('insertUnorderedList', false);
          break;
        case 'insertOrderedList':
          result = doc.execCommand('insertOrderedList', false);
          break;
        case 'indent':
          result = doc.execCommand('indent', false);
          break;
        case 'outdent':
          result = doc.execCommand('outdent', false);
          break;
        case 'undo':
          result = doc.execCommand('undo', false);
          break;
        case 'redo':
          result = doc.execCommand('redo', false);
          break;
        case 'removeFormat':
          result = doc.execCommand('removeFormat', false);
          break;
        default:
          console.log('Unknown command:', command);
      }
      
      console.log('Command result:', result);
      
      // Ensure focus is maintained after command
      if (doc.body) {
        doc.body.focus();
      }
      
      // Trigger immediate updates
      const newContent = doc.body.innerHTML;
      if (newContent !== contentRef.current) {
        contentRef.current = newContent;
        onChange(newContent);
      }
      
      // Update format states
      try {
        setCanUndo(doc.queryCommandEnabled('undo'));
        setCanRedo(doc.queryCommandEnabled('redo'));
        
        const formats = {
          bold: doc.queryCommandState('bold'),
          italic: doc.queryCommandState('italic'),
          underline: doc.queryCommandState('underline'),
          strikethrough: doc.queryCommandState('strikeThrough'),
          fontFamily: doc.queryCommandValue('fontName') || 'Arial',
          fontSize: doc.queryCommandValue('fontSize') || '14px',
          textColor: doc.queryCommandValue('foreColor') || '#000000',
          backgroundColor: doc.queryCommandValue('backColor') || '#ffffff',
          alignment: 'left',
          heading: 'p',
          listType: null as string | null
        };
        
        setActiveFormats(formats);
        onSelectionChange(formats);
      } catch (error) {
        console.warn('Error updating states after command:', error);
      }
      
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }, [onChange, onSelectionChange, isReady]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            executeCommand('redo');
          } else {
            executeCommand('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
      }
    }
  }, [executeCommand]);

  // Initialize editor when iframe loads - prevent multiple initializations
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || initializationRef.current) return;

    const initializeEditor = () => {
      const doc = iframe.contentDocument;
      if (!doc || initializationRef.current) return;

      initializationRef.current = true;
      setIsReady(false);

      try {
        // Ensure document structure exists (should be there with about:blank)
        if (!doc.head || !doc.body) {
          console.warn('Document structure missing, creating...');
          doc.documentElement.innerHTML = '<head></head><body></body>';
        }
        
        // Clear existing content and listeners to avoid duplication
        doc.head.innerHTML = '';
        doc.body.innerHTML = '';
        
        // Add CSS styles to head
        const style = doc.createElement('style');
        style.textContent = `
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            margin: 12px;
            padding: 0;
            background: white;
            color: black;
            outline: none;
          }
          * {
            box-sizing: border-box;
          }
          p {
            margin: 0 0 1em 0;
          }
          h1, h2, h3, h4, h5, h6 {
            margin: 0.5em 0;
          }
          ul, ol {
            margin: 0 0 1em 0;
            padding-left: 2em;
          }
          li {
            margin: 0.2em 0;
          }
          hr {
            border: none;
            border-top: 1px solid #ccc;
            margin: 1em 0;
          }
        `;
        doc.head.appendChild(style);

        // Set up body content
        const contentToSet = initialHtml || '<p>Start typing...</p>';
        doc.body.innerHTML = contentToSet;
        doc.body.contentEditable = 'true';
        
        // Ensure contentRef is updated
        contentRef.current = doc.body.innerHTML;
        
        // Enable design mode
        doc.designMode = 'on';
        
        // Set up event listeners with debouncing for performance
        const handleContentChange = () => {
          if (!isReady) return;
          const newContent = doc.body.innerHTML;
          if (newContent !== contentRef.current) {
            contentRef.current = newContent;
            onChange(newContent);
            try {
              setCanUndo(doc.queryCommandEnabled('undo'));
              setCanRedo(doc.queryCommandEnabled('redo'));
            } catch (error) {
              console.warn('Error updating command states:', error);
            }
          }
        };
        
        const handleSelectionChange = () => {
          if (!isReady) return;
          
          // Clear existing timeout
          if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
          }
          
          // Debounce selection changes
          selectionTimeoutRef.current = setTimeout(() => {
            try {
              const formats = {
                bold: doc.queryCommandState('bold'),
                italic: doc.queryCommandState('italic'),
                underline: doc.queryCommandState('underline'),
                strikethrough: doc.queryCommandState('strikeThrough'),
                fontFamily: doc.queryCommandValue('fontName') || 'Arial',
                fontSize: doc.queryCommandValue('fontSize') || '14px',
                textColor: doc.queryCommandValue('foreColor') || '#000000',
                backgroundColor: doc.queryCommandValue('backColor') || '#ffffff',
                alignment: 'left',
                heading: 'p',
                listType: null as string | null
              };
              
              setActiveFormats(formats);
              onSelectionChange(formats);
            } catch (error) {
              console.error('Error updating active formats:', error);
            }
          }, 50);
        };
        
        doc.addEventListener('input', handleContentChange);
        doc.addEventListener('selectionchange', handleSelectionChange);
        
        doc.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 'b':
                e.preventDefault();
                doc.execCommand('bold', false);
                handleSelectionChange();
                break;
              case 'i':
                e.preventDefault();
                doc.execCommand('italic', false);
                handleSelectionChange();
                break;
              case 'u':
                e.preventDefault();
                doc.execCommand('underline', false);
                handleSelectionChange();
                break;
              case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                  doc.execCommand('redo', false);
                } else {
                  doc.execCommand('undo', false);
                }
                handleContentChange();
                break;
              case 'y':
                e.preventDefault();
                doc.execCommand('redo', false);
                handleContentChange();
                break;
            }
          }
        });
        
        // Set ready state after a delay to ensure everything is initialized
        setTimeout(() => {
          if (doc.body) {
            doc.body.focus();
          }
          console.log('🟢 Rich text editor is now ready');
          setIsReady(true);
          handleSelectionChange(); // Initial format detection
        }, 200);
        
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        initializationRef.current = false;
      }
    };

    // Wait for iframe to load
    if (iframe.contentDocument?.readyState === 'complete') {
      initializeEditor();
    } else {
      iframe.onload = () => {
        initializeEditor();
      };
      
      // Fallback timeout to ensure editor becomes ready
      setTimeout(() => {
        if (!initializationRef.current) {
          initializeEditor();
        }
      }, 1000);
    }

    return () => {
      // Cleanup timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [initialHtml]); // Only reinitialize when initial HTML changes

  const handleUndo = useCallback(() => {
    executeCommand('undo');
  }, [executeCommand]);

  const handleRedo = useCallback(() => {
    executeCommand('redo');
  }, [executeCommand]);

  const handleClearFormat = useCallback(() => {
    executeCommand('removeFormat');
  }, [executeCommand]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <RichTextToolbar
        activeFormats={activeFormats}
        onFormat={executeCommand}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearFormat={handleClearFormat}
        canUndo={canUndo}
        canRedo={canRedo}
        disabled={!isReady}
      />
      
      <div className="border border-gray-300 border-t-0 rounded-b-lg bg-white">
        <iframe
          ref={iframeRef}
          src="about:blank"
          className="w-full h-96 border-0 bg-white"
          title="Rich Text Editor"
          sandbox="allow-same-origin allow-scripts"
          onLoad={() => {
            // Additional setup after iframe loads
            const iframe = iframeRef.current;
            if (iframe?.contentDocument?.body) {
              iframe.contentDocument.body.style.margin = '12px';
              iframe.contentDocument.body.style.padding = '0';
              iframe.contentDocument.body.style.outline = 'none';
            }
          }}
        />
      </div>
      
      {!isReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      )}
    </div>
  );
});

export default RichTextEditor;

// Add debug logging to window for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).debugRichTextEditor = () => {
    console.log('🔍 Debug info for RichTextEditor components:');
    
    const iframes = document.querySelectorAll('iframe[title="Rich Text Editor"]');
    console.log('Number of RichTextEditor iframes:', iframes.length);
    
    iframes.forEach((iframe, index) => {
      console.log(`Iframe ${index + 1}:`, {
        contentDocument: !!(iframe as HTMLIFrameElement).contentDocument,
        readyState: (iframe as HTMLIFrameElement).contentDocument?.readyState,
        bodyContent: (iframe as HTMLIFrameElement).contentDocument?.body?.innerHTML,
        bodyEditable: (iframe as HTMLIFrameElement).contentDocument?.body?.contentEditable,
        designMode: (iframe as HTMLIFrameElement).contentDocument?.designMode
      });
    });
    
    const toolbars = document.querySelectorAll('[class*="rich-text-editor"]');
    console.log('Number of toolbars:', toolbars.length);
    
    const fontSelects = document.querySelectorAll('select[class*="font"]');
    console.log('Font selects disabled:', Array.from(fontSelects).map(s => (s as HTMLSelectElement).disabled));
  };
}