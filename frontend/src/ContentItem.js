export default function ContentItem(props)
{
    return (
        <div className="content-item w-96 bg-zinc-950 my-4 min-h-24">
            {props.children}
        </div>
    );
}