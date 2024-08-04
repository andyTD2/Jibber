import { EditorContent } from '@tiptap/react';
import { twMerge } from 'tailwind-merge';

import Button from './Button';
import TipTapEditorTools from './TipTapEditorTools';
import { useTipTapEditor } from './hooks/useTipTapEditor';


export default function InputBox({className, editor}) 
{
	if(!editor) return null;

	return (
		<div className={twMerge("border-2 border-zinc-700 rounded-md", className)}>
			<TipTapEditorTools editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};
