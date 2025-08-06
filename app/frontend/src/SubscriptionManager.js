import { postData } from "./utils/fetch"
import { useStore } from "./Store"
import Button from "./Button"

import CONFIG from "./config"
import { twMerge } from "tailwind-merge";

/*
    Manages subscribing/unsubscribing to boards. The component itself is rendered
    as part of the BoardControls component.

    subscribed (bool, required): The current subscription status of the user

    setSubscribed (bool, required): A callback that will be called after successful subscription
        change on the server. Used to update the subscribed prop by the parent component.

    boardId (int, required): The ID of the board being subscribed/unsubscribed to
*/
export default function SubscriptionManager({subscribed, setSubscribed, boardId, className})
{
    //These control appending and removing to subscriptions in the leftbar
    const appendSubscriptions = useStore(state => state.appendSubscriptions);
    const removeSubscription = useStore(state => state.removeSubscription);

    /*
        Submits a request to the server to change subscription for the current board.
        On success, change the subscribed status, and update the subscriptions leftbar
    */
    const changeSubscription = (body) => 
    {
        postData({  baseRoute: `${CONFIG.API_URL}/changeSubscription`,
                    body: {boardId, ...body},
                    onSuccess: (result) => 
                    {
                        setSubscribed(result.newSubscriptionStatus)

                        if(result.newSubscriptionStatus)
                        {
                            appendSubscriptions({items: [{boardId: result.id, title: result.title, boardPicture: result.boardPicture}]})
                        }
                        else
                        {
                            removeSubscription(boardId);
                        }
                    }
        })

    }

    return <Button theme="outlined" className={twMerge("w-full mb-2", className)} handleClick={() => changeSubscription({currentSubscription: subscribed})}><div className="xxs:hidden">{subscribed ? "Unsubscribe" : "Subscribe"}</div><div className="xxs:block hidden w-12">{subscribed ? "Leave" : "Join"}</div></Button>
}