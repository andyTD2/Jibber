import { twMerge } from "tailwind-merge"

export default function TipTapButton({editor, onClick, active, className, img, children})
{
    return (
        <button 
            type="button"
            onClick={onClick}
            className={twMerge("mr-2 mt-0 p-2", editor.isActive(...active) ? 'bg-zinc-700' : 'hover:bg-zinc-800', className)}>
            <img src={img} className="w-5 h-5 object-contain"></img>
            {children}
        </button>
    )
}