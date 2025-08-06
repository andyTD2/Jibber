import { twMerge } from "tailwind-merge"

export default function Overlay({className, children}) 
{
    return (
        <div className={twMerge("overlay fixed h-full w-full top-0 left-0 bg-stone-400/50 z-30", className)}>
            {children}
        </div>
    )
}