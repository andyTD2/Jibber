import { Link } from "react-router-dom"
import Button from "./Button"
import SubscriptionManager from "./SubscriptionManager"

import { twMerge } from "tailwind-merge";


/*
    Component that handles any user controls related to boards. For now, it provides options to
    create posts or edit boards(if the user is a moderator)

    boardName (str, optional): Name of the board. Omitting this prop will cause it to not render certain
        board controls (create post, edit board)

    moderator (bool, optional): Set to true if user is a moderator; will render "Edit Board" button if truthy.
        Omission will be treated as falsy.

    subscribed (bool, required): Bool indicating whether a user is currently subscribed to this board.
        Omission will cause subscriptionManager to not render.

    setSubscribed (func, optional): Callback that will be triggered on success. Used in conjunction with subscribed prop
        to control state of the subscriptionManager. Omitting this prop will cause SubscriptionManager to not render.
        
    boardId (int, optional): ID of the corresponding board, required to communicate with the server. 
        Omitting this prop will cause SubscriptionManager to not render.
*/
export default function BoardControls({boardName, moderator, subscribed, setSubscribed, boardId, user, className, btnClassName})
{
    if(!user) return null;

    return (
        <div className={twMerge("color-transition dark:bg-dark1 bg-light1 shadow-md mb-8 p-3 rounded-md min-h-48", className)}>
            {subscribed != undefined && setSubscribed && boardId && <SubscriptionManager className={btnClassName} subscribed={subscribed} setSubscribed={setSubscribed} boardId={boardId}></SubscriptionManager>}
            {boardName && <Link to={`/b/${boardName}/newPost`}><Button theme="outlined" className={twMerge("w-full mb-2", btnClassName)}>Create Post</Button></Link>}
            {moderator && boardName &&
            <Link to={`/b/${boardName}/edit`}><Button theme="outlined" className={twMerge("w-full", btnClassName)}>Edit Board</Button></Link>
            }
        </div>
    )
}