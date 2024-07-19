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
import TipTapButton from './TipTapButton';
import Button from './Button';

const charLimit = 2000;


export default function TipTapEditor({className, onSubmit}) {
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
          class: 'mt-[3px] min-h-[200px] bg-zinc-800 p-2 break-all [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc',
        },
      },
  });

  if(!editor) return null;

  return (
    <div className={twMerge("border-2 border-zinc-700 rounded-md", className)}>
      <div className="flex h-10 items-center pl-2 bg-zinc-950">
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
          active={['heading', {level: 1}]}
          img="/h1-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
          active={['heading', {level: 2}]}
          img="/h2-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
          active={['heading', {level: 3}]}
          img="/h3-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={['bold']}
          img="/bold-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={['italic']}
          img="/italic-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={['strike']}
          img="/strike-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={['underline']}
          img="/underline-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={['subscript']}
          img="/sub-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={['superscript']}
          img="/super-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={['blockquote']}
          img="/blockquote-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={['bulletList']}
          img="/bullet-light.png">
        </TipTapButton>
        <TipTapButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={['orderedList']}
          img="/numbered-light.png">
        </TipTapButton>

      </div>
      <EditorContent
        editor={editor}
      />
      <div className="bg-zinc-950 p-2">
        <div className="flex justify-between">
          <Button
            handleClick={() => {onSubmit(editor.getHTML()); editor.commands.clearContent()}}
            className={"leading-normal h-min"}>
            Submit
          </Button>
          <div>{editor.storage.characterCount.characters()} / {charLimit}</div>
        </div>
      </div>
    </div>
  );
};
