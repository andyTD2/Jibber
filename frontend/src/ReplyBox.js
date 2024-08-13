import { EditorContent } from '@tiptap/react';
import { twMerge } from 'tailwind-merge';

import Button from './Button';
import TipTapEditorTools from './TipTapEditorTools';
import { useTipTapEditor } from './hooks/useTipTapEditor';
import CONFIG from "./config.json"
import InputBox from './InputBox';


export default function ReplyBox({className, onSubmit}) 
{
	const editor = useTipTapEditor({charLimit: CONFIG.GENERIC_MAX_LENGTH_LIMIT});
	if(!editor) return null;

	return (
		<div className={twMerge("border-2 border-zinc-700 rounded-md", className)}>
			<InputBox editor={editor} className={"min-h-[200px] border-none"}></InputBox>
			<div className="bg-zinc-950 p-2">
				<div className="flex justify-between">
				<Button
					handleClick={() => {onSubmit(editor.getHTML()); editor.commands.clearContent()}}
					className={"leading-normal h-min"}>
					Submit
				</Button>
				<div>{editor.storage.characterCount.characters()} / {CONFIG.GENERIC_MAX_LENGTH_LIMIT}</div>
				</div>
			</div>
		</div>
	);
};
