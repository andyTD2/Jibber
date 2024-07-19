import Button from "./Button"

export default function BoardControls()
{
    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md min-h-48">
            <Button className={"w-full mb-2"}>Subscribe</Button>
            <Button className={"w-full"}>Create Post</Button>
        </div>
    )
}