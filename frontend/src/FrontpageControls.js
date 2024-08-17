import { Link } from "react-router-dom"
import Button from "./Button"
import { useStore } from "./Store";

export default function FrontpageControls()
{
    const user = useStore((state) => state.user);


    if(user)
    {
        return (
            <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md">
                <Link to={`/createBoard`}><Button className={"w-full"}>Create Board</Button></Link>
            </div>
        )
    }

    return null;
}