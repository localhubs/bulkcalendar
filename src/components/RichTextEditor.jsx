import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import '../styles/RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter event description' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleCode = () => editor.chain().focus().toggleCodeBlock().run();
  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };
  const clearFormatting = () => editor.chain().focus().clearNodes().unsetAllMarks().run();

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={toggleBold}
            className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={toggleItalic}
            className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={toggleUnderline}
            className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline"
            type="button"
          >
            <u>U</u>
          </button>
          <button
            onClick={toggleStrike}
            className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
            type="button"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={toggleBulletList}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
            type="button"
          >
            ●●●
          </button>
          <button
            onClick={toggleOrderedList}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Ordered List"
            type="button"
          >
            1.
          </button>
          <button
            onClick={toggleBlockquote}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Blockquote"
            type="button"
          >
            "
          </button>
          <button
            onClick={toggleCode}
            className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code Block"
            type="button"
          >
            &lt;&gt;
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={setLink}
            className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
            title="Insert Link"
            type="button"
          >
            🔗
          </button>
          <button
            onClick={clearFormatting}
            className="toolbar-button"
            title="Clear Formatting"
            type="button"
          >
            ⟲
          </button>
        </div>
      </div>

      <EditorContent 
        editor={editor} 
        className="editor-content"
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
