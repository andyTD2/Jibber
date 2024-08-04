import { Link } from "react-router-dom"
import Button from "./Button"

export default function BoardControls({board})
{
    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md min-h-48">
            <Button className={"w-full mb-2"}>Subscribe</Button>
            <Link to={`/r/${board}/newPost`}><Button className={"w-full"}>Create Post</Button></Link>
        </div>
    )
}