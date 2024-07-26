import { useStore } from './Store';
import { twMerge } from 'tailwind-merge';

export default function Button({className, type, value, handleClick, children})
{
    const userThemePreference = useStore((state) => state.theme);
    let theme = userThemePreference === "dark" ? 
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
    : "bg-white text-black hover:bg-zinc-200";

    return (
        <button type={type} value={value} className={twMerge("text-center px-6 h-9 rounded-md", theme, className)} onClick={handleClick}>{children}</button>
    )
}