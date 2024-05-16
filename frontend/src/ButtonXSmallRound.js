import { useStore } from './Store';


export default function ButtonXSmallRound (props)
{
    const userThemePreference = useStore((state) => state.theme);
    let theme = userThemePreference === "dark" ? 
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
    : "bg-white text-black hover:bg-zinc-200";

    return (
        <button className={`${props.styles ? props.styles : ""} text-small px-2 rounded-md ${theme}`} onClick={props.onClick}>{props.children}</button>
    )
}