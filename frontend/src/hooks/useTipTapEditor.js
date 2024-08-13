import { useEditor } from '@tiptap/react';

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
import CodeBlock from '@tiptap/extension-code-block'
import CONFIG from "../config.json"

import { twMerge } from 'tailwind-merge';

export const useTipTapEditor = ({charLimit, className, onUpdate, initialContent, extensions}) =>
{
    if(!charLimit) charLimit = CONFIG.GENERIC_MAX_LENGTH_LIMIT;

    const options = 
    {
        extensions: 
        [
            Document, Paragraph, Text, Bold, Italic, Strike, Underline, 
            Subscript, Superscript, Blockquote, BulletList, ListItem, OrderedList, CodeBlock, 
            Heading.configure({levels: [1, 2, 3]}),
            CharacterCount.configure({limit: charLimit}),
        ],
        editorProps: 
        {
            attributes: 
            {
                class: `${twMerge("flex-1 p-2 break-all [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc", className)}`,
            },
        },
        content: initialContent
    }
    if(onUpdate)
        options.onUpdate = onUpdate;

    if(extensions)
        options.extensions = [Document, Text, Paragraph, CharacterCount.configure({limit: charLimit}), ...extensions];


    console.log("options", options);
    const editor = useEditor(options);

    return editor;
}