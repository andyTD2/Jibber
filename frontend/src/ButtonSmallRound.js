export default function ButtonSmallRound(props)
{
    let theme = props.theme === "dark" ? 
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
    : "bg-white text-black hover:bg-zinc-200";

    let className = `text-center px-6 h-9 leading-9 w-min rounded-xl ${theme}`;

    <input type="submit" value="CONTINUE" className="modalSubmit" />
    return (
        <button type={props.type} value={props.value} className={className}>{props.children}</button>
    )
}