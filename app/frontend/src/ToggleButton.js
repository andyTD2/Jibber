import { twMerge } from "tailwind-merge"

/*
    Stylized toggle button slider. Used to toggle theme, but can be applied elsewhere

    className (str, optional): optional styling
    enabled (bool, optional): sets the initial slider position
*/
export default function ToggleButton({className, enabled})
{
    return (
        <div 
        className={twMerge(`flex items-end justify-center w-4 h-7 rounded-full transition-all duration-500 ${enabled ? "bg-zinc-500" : "bg-primary1"}`, className)}>
            <div 
                className={`h-4 w-4 -mb-1 rounded-full transition-all duration-[1s] transform ${
                    enabled ? "translate-y-[-1.25rem] bg-primary1" : "translate-y-0 bg-zinc-200"
                }`}
            ></div>
        </div>
    )
}