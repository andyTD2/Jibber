import { EditorContent } from '@tiptap/react';
import { twMerge } from 'tailwind-merge';

import TipTapEditorTools from './TipTapEditorTools';


export default function InputBox({className, toolsClassName, editorClassName, editor, showTools=true}) 
{
	if(!editor) return null;

	return (
		<div className={twMerge("box-border border-2 border-zinc-700 flex flex-col", className)}>
			{showTools && <TipTapEditorTools editor={editor} className={toolsClassName} />}
			<EditorContent editor={editor} className={twMerge("bg-zinc-800 flex-1 flex flex-col", editorClassName)}/>
		</div>
	);
};
