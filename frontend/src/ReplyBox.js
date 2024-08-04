import { EditorContent } from '@tiptap/react';
import { twMerge } from 'tailwind-merge';

import Button from './Button';
import TipTapEditorTools from './TipTapEditorTools';
import { useTipTapEditor } from './hooks/useTipTapEditor';

const charLimit = 2000;


export default function ReplyBox({className, onSubmit}) 
{
	const editor = useTipTapEditor({charLimit});
	if(!editor) return null;

	return (
		<div className={twMerge("border-2 border-zinc-700 rounded-md", className)}>
			<TipTapEditorTools editor={editor} />
			<EditorContent editor={editor} />
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
