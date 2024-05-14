import { useStore } from './Store';


export default function ButtonXSmallRound (props)
{
    const userThemePreference = useStore((state) => state.theme);
    let theme = userThemePreference === "dark" ? 
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
    : "bg-white text-black hover:bg-zinc-200";


    let className = `${props.styles ? props.styles : ""} text-small px-2 rounded-md ${theme}`
    return (
        <button className={className} onClick={props.onClick}>{props.children}</button>
    )
}