import { EditorContent } from '@tiptap/react';
import { twMerge } from 'tailwind-merge';

import TipTapEditorTools from './TipTapEditorTools';

/*
	This component provides an input box for text. Unlike typical <input> elements, this
	makes use of Tip Tap rich text editor. It features most typical tools for text editing
	and formatting.

	className (str, optional): Optional styling to be applied to outer most container

	toolsClassName (str, optional): Optional styling to be applied to the tools box

	editorClassName (str, optional): Optional styling to be applied to the input box

	editor (TipTapEditor, required): An instance of a TipTapEditor

	showTools (bool, optional, default: true): Set to false if you want to hide the toolbar
*/

export default function InputBox({className, toolsClassName, editorClassName, editor, showTools=true}) 
{
	if(!editor) return null;

	return (
		<div className={twMerge("box-border flex flex-col shadow-2xl rounded-md", className)}>
			{showTools && <TipTapEditorTools editor={editor} className={toolsClassName} />}
			<EditorContent editor={editor} className={twMerge("rounded-md color-transition flex-1 flex flex-col min-h-32 dark:bg-dark3 bg-light2 dark:text-darkText1 text-lightText1", editorClassName)}/>
		</div>
	);
};
