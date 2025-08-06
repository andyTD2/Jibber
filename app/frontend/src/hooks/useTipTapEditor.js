import { useEditor } from '@tiptap/react';

import HardBreak from '@tiptap/extension-hard-break'
import TextAlign from '@tiptap/extension-text-align'
import Document from '@tiptap/extension-document';
import Bold from '@tiptap/extension-bold';
import Strike from '@tiptap/extension-strike';
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Link from '@tiptap/extension-link';
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
import History from '@tiptap/extension-history'
import CONFIG from "../config"

import { twMerge } from 'tailwind-merge';

/*
    Creates and instantiates an instance of a TipTap rich text editor.

    charLimit (int, optional, default: (see config)): The max character limit for the text box

    className (str, optional): Styling to pass to the editor

    onUpdate (func, optional): Optional callback that is triggered every time the editor updates

    initialContent (str, optional): Initial content inside the text box

    extensions ([...], optional): An array of optional extensions to use

    return (TipTapEditor): Returns the editor
*/
export const useTipTapEditor = ({charLimit, className, onUpdate, initialContent, extensions}) =>
{
    if(!charLimit) charLimit = CONFIG.GENERIC_MAX_LENGTH_LIMIT;

    const options = 
    {
        //Extensions are the tools we want to support in the editor. These are the standard tools we support
        extensions: 
        [
            Document, Paragraph, Text, Bold, Italic, Strike, Underline,
            Subscript, Superscript, Blockquote, BulletList, ListItem, OrderedList, CodeBlock, History,
            HardBreak,
            Heading.configure({levels: [1, 2, 3]}),
            CharacterCount.configure({limit: charLimit}),
            Link.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['https', 'http'],
                linkOnPaste: true
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
              })
        ],
        //We can use this to pass styling to the editor
        editorProps: 
        {
            attributes: 
            {
                class: `${twMerge("[&_a:visited]:text-purple-600 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:cursor-pointer outline-primaryp flex-1 p-2 break-words [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc ", className)}`,
            },
        },
        content: initialContent
    }
    //Can pass a custom onUpdate function
    if(onUpdate)
        options.onUpdate = onUpdate;

    //More extensions can be passed or overwritten
    if(extensions)
        options.extensions = [Document, Text, Paragraph, CharacterCount.configure({limit: charLimit}), ...extensions];

    //Create editor with options
    const editor = useEditor(options);

    return editor;
}