'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function TestRichTextEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [content, setContent] = useState('Test content');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const initializeEditor = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      console.log('Initializing test editor...');

      try {
        // Simple initialization
        doc.body.innerHTML = '<p>Hello world! This is a test.</p>';
        doc.body.contentEditable = 'true';
        doc.body.style.padding = '10px';
        doc.body.style.border = '1px solid #ccc';
        doc.body.style.fontFamily = 'Arial, sans-serif';
        doc.body.style.fontSize = '14px';
        doc.body.style.outline = 'none';
        
        // Add event listeners
        doc.body.addEventListener('input', () => {
          console.log('Content changed:', doc.body.innerHTML);
          setContent(doc.body.innerHTML);
        });

        doc.body.focus();
        setIsReady(true);
        console.log('Test editor initialized successfully');
      } catch (error) {
        console.error('Error initializing test editor:', error);
      }
    };

    // Initialize when iframe loads
    if (iframe.contentDocument?.readyState === 'complete') {
      initializeEditor();
    } else {
      iframe.onload = initializeEditor;
    }
  }, []);

  const testBold = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    
    console.log('Testing bold command...');
    
    // Select some text first
    const doc = iframe.contentDocument;
    const range = doc.createRange();
    const textNode = doc.body.firstChild?.firstChild; // Get the text node inside the p tag
    if (textNode) {
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5); // Select first 5 characters
      
      const selection = doc.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Now execute bold
        const result = doc.execCommand('bold', false);
        console.log('Bold command result:', result);
        console.log('Updated content:', doc.body.innerHTML);
      }
    }
  };

  const testItalic = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    
    console.log('Testing italic command...');
    
    // Select some text first
    const doc = iframe.contentDocument;
    const range = doc.createRange();
    const textNode = doc.body.firstChild?.firstChild; // Get the text node inside the p tag
    if (textNode) {
      range.setStart(textNode, 6);
      range.setEnd(textNode, 11); // Select characters 6-11
      
      const selection = doc.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Now execute italic
        const result = doc.execCommand('italic', false);
        console.log('Italic command result:', result);
        console.log('Updated content:', doc.body.innerHTML);
      }
    }
  };

  const testUnderline = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    
    console.log('Testing underline command...');
    
    // Select some text first
    const doc = iframe.contentDocument;
    const range = doc.createRange();
    const textNode = doc.body.firstChild?.firstChild; // Get the text node inside the p tag
    if (textNode) {
      range.setStart(textNode, 12);
      range.setEnd(textNode, 17); // Select characters 12-17
      
      const selection = doc.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Now execute underline
        const result = doc.execCommand('underline', false);
        console.log('Underline command result:', result);
        console.log('Updated content:', doc.body.innerHTML);
      }
    }
  };

  const testToolbarButtons = () => {
    console.log('🧪 Testing toolbar buttons...');
    
    // Get the actual RichTextEditor toolbar buttons
    const boldButton = document.querySelector('[title="Bold (Ctrl+B)"]') as HTMLButtonElement;
    const italicButton = document.querySelector('[title="Italic (Ctrl+I)"]') as HTMLButtonElement;
    const underlineButton = document.querySelector('[title="Underline (Ctrl+U)"]') as HTMLButtonElement;
    
    console.log('📋 Button search results:');
    console.log('  Bold button:', boldButton);
    console.log('  Italic button:', italicButton);
    console.log('  Underline button:', underlineButton);
    
    // Get the RichTextEditor iframe
    const richTextIframe = document.querySelector('iframe[title="Rich Text Editor"]') as HTMLIFrameElement;
    console.log('📱 RichTextEditor iframe:', richTextIframe);
    
    if (richTextIframe?.contentDocument) {
      console.log('📝 RichTextEditor content before click:', richTextIframe.contentDocument.body.innerHTML);
      
      // Create selection in RichTextEditor
      const doc = richTextIframe.contentDocument;
      const range = doc.createRange();
      const textNode = doc.body.firstChild?.firstChild; // Navigate to text node
      
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        range.setStart(textNode, 0);
        range.setEnd(textNode, Math.min(5, textNode.textContent?.length || 0));
        
        const selection = doc.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          console.log('✅ Selection created in RichTextEditor');
        }
      }
    }
    
    if (boldButton) {
      console.log('🖱️ Clicking bold button...');
      console.log('📊 Button state before click:', {
        disabled: boldButton.disabled,
        className: boldButton.className,
        innerHTML: boldButton.innerHTML
      });
      
      // Monitor for changes
      const observer = new MutationObserver((mutations) => {
        console.log('🔄 DOM mutations detected after button click:', mutations.length);
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            console.log('  - Child list changed:', mutation.target);
          }
          if (mutation.type === 'attributes') {
            console.log('  - Attribute changed:', mutation.attributeName, 'on', mutation.target);
          }
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      
      boldButton.click();
      
      // Check results after click
      setTimeout(() => {
        observer.disconnect();
        
        console.log('📊 Button state after click:', {
          disabled: boldButton.disabled,
          className: boldButton.className,
          innerHTML: boldButton.innerHTML
        });
        
        if (richTextIframe?.contentDocument) {
          console.log('📝 RichTextEditor content after click:', richTextIframe.contentDocument.body.innerHTML);
          console.log('🎯 Bold state:', richTextIframe.contentDocument.queryCommandState('bold'));
        }
      }, 500);
    } else {
      console.log('❌ Bold button not found');
    }
    
    setTimeout(() => {
      if (italicButton) {
        console.log('🖱️ Clicking italic button...');
        italicButton.click();
        
        setTimeout(() => {
          if (richTextIframe?.contentDocument) {
            console.log('📝 Content after italic click:', richTextIframe.contentDocument.body.innerHTML);
          }
        }, 500);
      } else {
        console.log('❌ Italic button not found');
      }
    }, 1000);
    
    setTimeout(() => {
      if (underlineButton) {
        console.log('🖱️ Clicking underline button...');
        underlineButton.click();
        
        setTimeout(() => {
          if (richTextIframe?.contentDocument) {
            console.log('📝 Content after underline click:', richTextIframe.contentDocument.body.innerHTML);
          }
        }, 500);
      } else {
        console.log('❌ Underline button not found');
      }
    }, 2000);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Rich Text Editor Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={testBold}
          className="px-3 py-1 mr-2 bg-blue-500 text-white rounded"
          disabled={!isReady}
        >
          Bold
        </button>
        <button 
          onClick={testItalic}
          className="px-3 py-1 mr-2 bg-blue-500 text-white rounded"
          disabled={!isReady}
        >
          Italic
        </button>
        <button 
          onClick={testUnderline}
          className="px-3 py-1 mr-2 bg-blue-500 text-white rounded"
          disabled={!isReady}
        >
          Underline
        </button>
        <button 
          onClick={testToolbarButtons}
          className="px-3 py-1 mr-2 bg-green-500 text-white rounded"
          disabled={!isReady}
        >
          Test Toolbar
        </button>
      </div>

      <div className="mb-4">
        <strong>Status:</strong> {isReady ? 'Ready' : 'Loading...'}
      </div>

      <div className="mb-4">
        <iframe
          ref={iframeRef}
          className="w-full h-32 border border-gray-300"
          title="Test Rich Text Editor"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>

      <div className="mb-4">
        <strong>Current Content:</strong>
        <pre className="bg-gray-100 p-2 rounded text-sm">{content}</pre>
      </div>
    </div>
  );
}