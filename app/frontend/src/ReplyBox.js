import { twMerge } from 'tailwind-merge';
import { useTipTapEditor } from './hooks/useTipTapEditor';

import InputBox from './InputBox';
import Button from './Button';

import CONFIG from "./config"
import { useState } from 'react';

/*
	ReplyBox is used for replying to comments, posts, and messages. It uses TipTap rich text editor.
	Provides a textual input box for text, and standard tools for text formatting.

	className (str, optional): Optional styling to be applied to the reply box

	onSubmit (func, required): The callback function that defines the behavior for clicking the
		submit button.
*/
export default function ReplyBox({className, onSubmit, charLimit = CONFIG.GENERIC_MAX_LENGTH_LIMIT, clearContentOnSubmit = true}) 
{
	const [error, setError] = useState(undefined);

	//TipTap editor
	const editor = useTipTapEditor({charLimit, className: "rounded-none"});

	if(!editor) return null;

	return (
		<div className={twMerge("outline-none border-2 border-zinc-400 rounded-md shadow-md", className)}>
			<InputBox editor={editor} className={"min-h-[200px] border-none"} toolsClassName={"rounded-t-md"} editorClassName={"rounded-none"}></InputBox>
			<div className="color-transition dark:bg-dark1 bg-light4 p-2 rounded-b-md">
				<div className="flex justify-between">
					<div className='flex'>
						<Button
							handleClick={() => 
							{
								setError(undefined)
								onSubmit(
									editor.getHTML(),
									() => {
										if(clearContentOnSubmit) 
											editor.commands.clearContent()
									},
									(response) => {
										setError(response.error);
									}
								); 
							}}
							className={"leading-normal h-min"} theme="primary">
							Submit
						</Button>
						{error && <div className='ml-2 text-red-600'>{error}</div>}
					</div>
					<div>{editor.storage.characterCount.characters()} / {charLimit}</div>
				</div>
			</div>
		</div>
	);
};
