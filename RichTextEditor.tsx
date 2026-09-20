import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { 
  Bold, 
  Italic, 
  Palette, 
  RotateCcw, 
  RotateCw, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { convertStoredContentToHtml } from '../utils/sanitize';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COLOR_OPTIONS = [
  { label: 'Default', value: 'default', color: '#e5e7eb', isDefault: true },
  { label: 'SKR Gold', value: '#D4AF37', color: '#D4AF37', isPrimary: true },
  { label: 'White', value: '#FFFFFF', color: '#FFFFFF' },
  { label: 'Silver', value: '#9CA3AF', color: '#9CA3AF' },
  { label: 'Amber', value: '#F59E0B', color: '#F59E0B' },
  { label: 'Red', value: '#EF4444', color: '#EF4444' },
  { label: 'Green', value: '#10B981', color: '#10B981' },
  { label: 'Blue', value: '#38BDF8', color: '#38BDF8' },
];

export default function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#D4AF37');
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

  const htmlContent = convertStoredContentToHtml(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextStyle,
      Color,
    ],
    content: htmlContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[380px] p-6 text-gray-200 font-light leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-a:text-[#d4af37] prose-p:text-gray-300',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Keep editor content in sync when opening a different post
  useEffect(() => {
    if (editor) {
      const converted = convertStoredContentToHtml(initialContent);
      const currentHtml = editor.getHTML();
      if (converted !== currentHtml) {
        editor.commands.setContent(converted, { emitUpdate: false });
      }
    }
  }, [initialContent, editor]);

  // Handle outside clicks to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!editor) {
    return (
      <div className="w-full h-[400px] bg-[#050a30] border border-white/10 flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  // Get current block format label
  const getCurrentFormatLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    return 'Paragraph';
  };

  const handleApplyColor = (colorValue: string) => {
    if (colorValue === 'default') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(colorValue).run();
    }
    setIsColorPickerOpen(false);
  };

  return (
    <div className="w-full border border-white/10 bg-[#050a30] rounded-sm overflow-hidden flex flex-col">
      {/* Visual Toolbar */}
      <div className="bg-[#070e3a] border-b border-white/10 p-2 flex flex-wrap items-center gap-2 text-sm select-none">
        
        {/* Format Selector (Paragraph / H1 / H2 / H3 / H4) */}
        <div className="relative" ref={formatDropdownRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsFormatDropdownOpen(!isFormatDropdownOpen);
              setIsColorPickerOpen(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-200 hover:text-white transition-colors text-xs font-medium"
            title="Choose paragraph or heading style"
          >
            <span className="font-serif">{getCurrentFormatLabel()}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isFormatDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-[#0a1142] border border-white/15 rounded shadow-2xl py-1 z-50">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setIsFormatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 text-xs transition-colors ${
                  !editor.isActive('heading') ? 'text-[#d4af37] font-semibold bg-white/5' : 'text-gray-300'
                }`}
              >
                <span>Normal Paragraph</span>
                {!editor.isActive('heading') && <Check size={14} />}
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  setIsFormatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 text-xs transition-colors font-serif ${
                  editor.isActive('heading', { level: 1 }) ? 'text-[#d4af37] font-bold bg-white/5' : 'text-gray-300'
                }`}
              >
                <span className="text-base font-bold">Heading 1 (Main Title)</span>
                {editor.isActive('heading', { level: 1 }) && <Check size={14} />}
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setIsFormatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 text-xs transition-colors font-serif ${
                  editor.isActive('heading', { level: 2 }) ? 'text-[#d4af37] font-bold bg-white/5' : 'text-gray-300'
                }`}
              >
                <span className="text-sm font-semibold">Heading 2 (Section)</span>
                {editor.isActive('heading', { level: 2 }) && <Check size={14} />}
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                  setIsFormatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 text-xs transition-colors font-serif ${
                  editor.isActive('heading', { level: 3 }) ? 'text-[#d4af37] font-semibold bg-white/5' : 'text-gray-300'
                }`}
              >
                <span className="text-xs font-medium">Heading 3 (Subsection)</span>
                {editor.isActive('heading', { level: 3 }) && <Check size={14} />}
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 4 }).run();
                  setIsFormatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 text-xs transition-colors font-serif ${
                  editor.isActive('heading', { level: 4 }) ? 'text-[#d4af37] font-medium bg-white/5' : 'text-gray-300'
                }`}
              >
                <span className="text-xs">Heading 4 (Minor)</span>
                {editor.isActive('heading', { level: 4 }) && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

        {/* Bold Button [B] */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors border ${
            editor.isActive('bold')
              ? 'bg-[#d4af37] text-[#050a30] border-[#d4af37] font-bold'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={15} />
        </button>

        {/* Italic Button [I] */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors border ${
            editor.isActive('italic')
              ? 'bg-[#d4af37] text-[#050a30] border-[#d4af37]'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={15} />
        </button>

        {/* Separator */}
        <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

        {/* Text Color Popover / Dropdown */}
        <div className="relative" ref={colorDropdownRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsColorPickerOpen(!isColorPickerOpen);
              setIsFormatDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-200 hover:text-white transition-colors text-xs font-medium"
            title="Text Color"
          >
            <Palette size={14} className="text-[#d4af37]" />
            <span>Text Color</span>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {isColorPickerOpen && (
            <div className="absolute left-0 top-full mt-1 w-52 bg-[#0a1142] border border-white/15 rounded shadow-2xl p-2 z-50">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-2 py-1 mb-1 border-b border-white/10">
                Text Color
              </div>
              <div className="space-y-0.5">
                {COLOR_OPTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleApplyColor(item.value)}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 flex items-center justify-between text-xs text-gray-200 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={item.isPrimary ? 'text-[#d4af37] font-medium' : ''}>
                        {item.label}
                      </span>
                    </div>
                    {item.isPrimary && (
                      <span className="text-[10px] uppercase text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded">
                        Gold
                      </span>
                    )}
                  </button>
                ))}

                {/* Custom Color Option */}
                <div className="pt-1 mt-1 border-t border-white/10">
                  <label 
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full px-2.5 py-1.5 rounded hover:bg-white/10 flex items-center justify-between text-xs text-gray-200 transition-colors cursor-pointer relative"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/30 inline-block bg-gradient-to-tr from-pink-500 via-amber-400 to-sky-400 shadow-sm" />
                      <span>Custom Color</span>
                    </div>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        handleApplyColor(e.target.value);
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

        {/* Undo Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-300 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={14} />
        </button>

        {/* Redo Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-300 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* Visual Editor Surface (Word / Google Docs Experience) */}
      <div 
        className="flex-1 cursor-text bg-[#050a30]"
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Helpful client guidance at the bottom */}
      <div className="bg-[#070e3a]/60 px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          <span>Type naturally. Select any word or phrase to apply styles or colors from the toolbar.</span>
        </div>
      </div>
    </div>
  );
}
