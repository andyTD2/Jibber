import { twMerge } from "tailwind-merge"

/*
    Renders a single button for tip tap editor tools. Used as part of a larger toolbar

    editor (TipTapEditor, required): instance of a tip tap editor

    onClick (func, required): Callback that is triggered when the button is clicked

    active ([str, obj], required): The first element of the array is a string corresponding
        to the type of modification being applied (heading, underline, italic). The optional 
        second element is an object that defines the level (ie, heading level 3). 
        Example format: ['heading', {level: 3}] or just ['italic']

    className (str, optional): optional styling

    img (str, required): Img SRC link for the tool's image

    children (ReactNode, optional): Optional react content that can be rendered in the button
*/
export default function TipTapButton({editor, onClick, active, className, img, children})
{

    let defaultClasses = undefined;

    if(active)
    {
        defaultClasses = twMerge("mr-2 mt-0 p-2", defaultClasses, editor.isActive(...active) ? 'bg-zinc-700' : 'hover:bg-zinc-800', className)
    }
    else
    {
        defaultClasses = twMerge("mr-2 mt-0 p-2 hover:bg-zinc-800", className)
    }

    return (
        <button 
            type="button"
            onClick={onClick}
            className={defaultClasses}>
            <img src={img} className="w-5 h-5 object-contain"></img>
            {children}
        </button>
    )
}