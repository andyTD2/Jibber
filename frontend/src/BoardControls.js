import { Link } from "react-router-dom"
import Button from "./Button"

export default function BoardControls({board, moderator})
{
    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md min-h-48 w-80">
            <Button className={"w-full mb-2"}>Subscribe</Button>
            <Link to={`/r/${board}/newPost`}><Button className={"w-full mb-2"}>Create Post</Button></Link>
            {moderator &&
            <Link to={`/r/${board}/edit`}><Button className={"w-full"}>Edit Board</Button></Link>
            }
        </div>
    )
}