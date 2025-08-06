import { useState } from "react"
import { twMerge } from "tailwind-merge"

export default function ModerationMenuElement({handleClick, className, children}) 
{
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSuccess = () => {
        setLoading(false);
        setSuccess(true);
    }

    return (
        <button
            className={twMerge("first:rounded-t-md last:rounded-b-md whitespace-nowrap text-left hover:bg-altlight3 hover:cursor-pointer text-red-400 px-2 w-full h-6", className)}
            disabled={loading || success}
            onClick={() =>
            {
                setLoading(true)
                handleClick(handleSuccess)
            }}
        >
            {loading && <img className="h-4 w-4" src="/spinner-light.svg"></img>}
            {!loading && !success && children}
            {!loading && success && <img className="h-4 w-4" src="/checkmark-green.png"></img>}
        </button>
    )
}