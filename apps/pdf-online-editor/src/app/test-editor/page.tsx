'use client';

import TestRichTextEditor from '../../components/richtext/TestRichTextEditor';
import RichTextEditor from '../../components/richtext/RichTextEditor';
import { useState } from 'react';

export default function TestEditorPage() {
  const [richTextContent, setRichTextContent] = useState('<p>This is a test of the actual RichTextEditor component.</p>');
  const [activeFormats, setActiveFormats] = useState({
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
  } as any);
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Rich Text Editor Test Page</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          This page tests the basic rich text editor functionality. 
          Open the browser console to see debug messages.
        </p>
        
        <p className="text-gray-600 mb-4">
          Instructions:
        </p>
        <ol className="list-decimal list-inside text-gray-600 mb-4">
          <li>Wait for the editor to load (Status: Ready)</li>
          <li>Click inside the editor and select some text</li>
          <li>Click the Bold, Italic, or Underline buttons</li>
          <li>Check the console for debug messages</li>
          <li>Verify the content changes in the &quot;Current Content&quot; section</li>
        </ol>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🧪 Debug Tools</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                console.log('🔍 Manual Debug - Page State:');
                console.log('  - Active formats:', activeFormats);
                console.log('  - Rich text content:', richTextContent);
                
                const richTextIframe = document.querySelector('iframe[title="Rich Text Editor"]') as HTMLIFrameElement;
                if (richTextIframe?.contentDocument) {
                  console.log('  - Iframe content:', richTextIframe.contentDocument.body.innerHTML);
                  console.log('  - Iframe ready:', richTextIframe.contentDocument.readyState);
                  console.log('  - Design mode:', richTextIframe.contentDocument.designMode);
                } else {
                  console.log('  - Iframe not found or not ready');
                }
                
                const buttons = {
                  bold: document.querySelector('[title="Bold (Ctrl+B)"]'),
                  italic: document.querySelector('[title="Italic (Ctrl+I)"]'),
                  underline: document.querySelector('[title="Underline (Ctrl+U)"]')
                };
                console.log('  - Toolbar buttons:', buttons);
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Debug State
            </button>
            
            <button 
              onClick={() => {
                console.log('🔄 Forcing re-render...');
                setActiveFormats(prev => ({ ...prev, bold: !prev.bold }));
                setTimeout(() => {
                  setActiveFormats(prev => ({ ...prev, bold: !prev.bold }));
                }, 100);
              }}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Force Re-render
            </button>
            
            <button 
              onClick={() => {
                console.log('🎯 Testing direct execCommand...');
                const richTextIframe = document.querySelector('iframe[title="Rich Text Editor"]') as HTMLIFrameElement;
                if (richTextIframe?.contentDocument) {
                  const doc = richTextIframe.contentDocument;
                  doc.body.focus();
                  
                  // Create selection
                  const range = doc.createRange();
                  const textNode = doc.body.firstChild?.firstChild;
                  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    range.setStart(textNode, 0);
                    range.setEnd(textNode, Math.min(5, textNode.textContent?.length || 0));
                    
                    const selection = doc.getSelection();
                    if (selection) {
                      selection.removeAllRanges();
                      selection.addRange(range);
                      
                      // Execute command
                      const result = doc.execCommand('bold', false);
                      console.log('  - execCommand result:', result);
                      console.log('  - New content:', doc.body.innerHTML);
                    }
                  }
                } else {
                  console.log('  - Iframe not ready');
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test execCommand
            </button>
            
            <button 
              onClick={() => {
                (window as any).debugRichTextEditor?.();
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Debug Editor
            </button>
          </div>
        </div>
      </div>
      
      <TestRichTextEditor />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Actual RichTextEditor Component</h2>
        <p className="text-gray-600 mb-4">
          This is the actual RichTextEditor component that would be used in the application.
        </p>
        
        <div className="border rounded-lg p-4">
          <RichTextEditor
            initialHtml={richTextContent}
            onChange={(html) => {
              console.log('RichTextEditor onChange:', html);
              setRichTextContent(html);
            }}
            onSelectionChange={(formats) => {
              console.log('RichTextEditor onSelectionChange:', formats);
              setActiveFormats(formats);
            }}
            className="rich-text-test"
          />
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Current Content:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">{richTextContent}</pre>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Active Formats:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(activeFormats, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}