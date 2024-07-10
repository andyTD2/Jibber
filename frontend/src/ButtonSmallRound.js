import { twMerge

 } from "tailwind-merge";
export default function ButtonSmallRound(props)
{
    let theme = props.theme === "dark" ? 
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
    : "bg-white text-black hover:bg-zinc-200";

    let className = twMerge("text-center px-6 h-9 leading-9 rounded-xl", theme, props.className);

    <input type="submit" value="CONTINUE" className="modalSubmit" />
    return (
        <button type={props.type} value={props.value} className={className} onClick={props.handleClick}>{props.children}</button>
    )
}