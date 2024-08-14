import { Link } from "react-router-dom"
import Button from "./Button"
import SubscriptionManager from "./SubscriptionManager"

export default function BoardControls({boardName, moderator, subscribed, setSubscribed, boardId, user})
{
    if(!user) return null;

    return (
        <div className="h-min bg-zinc-950 mb-8 p-3 rounded-md min-h-48 w-80">
            <SubscriptionManager subscribed={subscribed} setSubscribed={setSubscribed} boardId={boardId}></SubscriptionManager>
            <Link to={`/r/${boardName}/newPost`}><Button className={"w-full mb-2"}>Create Post</Button></Link>
            {moderator &&
            <Link to={`/r/${boardName}/edit`}><Button className={"w-full"}>Edit Board</Button></Link>
            }
        </div>
    )
}