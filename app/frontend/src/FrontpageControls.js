import { Link } from "react-router-dom"
import Button from "./Button"
import { useStore } from "./Store";


/*
    For now, this component only renders a button that allows users to create a new board.
    This component will be updated in the future if any more controls viewable on the frontpage 
    are introduced.
*/
export default function FrontpageControls()
{
    const user = useStore((state) => state.user);

    if(user)
    {
        return (
            <div className="shadow-md h-min color-transition dark:bg-dark1 bg-light1 mb-8 p-3 rounded-md">
                <Link to={`/createBoard`}><Button className={"w-full"} theme="primary">Create Board</Button></Link>
            </div>
        )
    }

    return null;
}