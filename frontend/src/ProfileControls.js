import { Link } from "react-router-dom"
import Button from "./Button"

export default function ProfileControls({profile})
{
    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md w-80">
            <Link to={`/u/${profile}/edit`}><Button className={"w-full"}>Edit Profile</Button></Link>
        </div>
    )
}