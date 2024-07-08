import { useEditor, EditorContent } from '@tiptap/react';

import Document from '@tiptap/extension-document';
import Bold from '@tiptap/extension-bold';
import Strike from '@tiptap/extension-strike';
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Blockquote from '@tiptap/extension-blockquote'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading';
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import CharacterCount from '@tiptap/extension-character-count'
import { twMerge } from 'tailwind-merge';

const charLimit = 2000

export default function TipTapEditor({className}) {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold, Italic, Strike, Underline, 
                Subscript, Superscript, Blockquote, BulletList, ListItem, OrderedList,
                Heading.configure({levels: [1, 2, 3]}),
                CharacterCount.configure({
                  limit: charLimit,
                }),
    ],
    editorProps: {
        attributes: {
          class: 'min-h-[200px] bg-zinc-800 pt-2 break-all [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc',
        },
      },
  });

  if(!editor) return null;

  return (
    <div className={twMerge("border border-gray-300 rounded-md", className)}>
      <div className="flex">
        <button 
          onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
          className={twMerge("mr-2", editor.isActive('heading', {level : 1}) ? 'bg-blue-400' : '')}>
          h1
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
          className={twMerge("mr-2", editor.isActive('heading', {level : 2}) ? 'bg-blue-400' : '')}>
          h2
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
          className={twMerge("mr-2", editor.isActive('heading', {level : 3}) ? 'bg-blue-400' : '')}>
          h3
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={twMerge("mr-2", editor.isActive('bold') ? 'bg-blue-400' : '')}>
          bold
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={twMerge("mr-2", editor.isActive('italic') ? 'bg-blue-400' : '')}>
          Italic
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={twMerge("mr-2", editor.isActive('strike') ? 'bg-blue-400' : '')}>
          Strike
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={twMerge("mr-2", editor.isActive('underline') ? 'bg-blue-400' : '')}>
          Underline
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={twMerge("mr-2", editor.isActive('subscript') ? 'bg-blue-400' : '')}>
          Subscript
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={twMerge("mr-2", editor.isActive('superscript') ? 'bg-blue-400' : '')}>
          Superscript
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={twMerge("mr-2", editor.isActive('blockquote') ? 'bg-blue-400' : '')}>
          Blockquote
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={twMerge("mr-2", editor.isActive('bulletlist') ? 'bg-blue-400' : '')}>
          Bullet List
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={twMerge("mr-2", editor.isActive('orderedlist') ? 'bg-blue-400' : '')}>
          Ordered List
        </button>
      </div>
      <EditorContent
        editor={editor}
      />
      <div>
        {editor.storage.characterCount.characters()} / {charLimit}
      </div>
    </div>
  );
};
