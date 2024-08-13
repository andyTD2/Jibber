import { Link } from "react-router-dom"
import Button from "./Button"

export default function FrontpageControls()
{
    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md">
            <Link to={`/createBoard`}><Button className={"w-full"}>Create Board</Button></Link>
        </div>
    )
}