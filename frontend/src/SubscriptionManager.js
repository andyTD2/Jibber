import { postData } from "./utils/fetch"
import Button from "./Button"

export default function SubscriptionManager({subscribed, setSubscribed, boardId})
{
    console.log("sub", subscribed)
    //{baseRoute, queryParams, body, onSuccess, onFailure}
    const changeSubscription = (body) => 
    {
        postData({  baseRoute: "https://localhost:3000/changeSubscription",
                    body: {boardId, ...body},
                    onSuccess: (result) => {console.log("ree", result); setSubscribed(result.newSubscriptionStatus)},
                    onFailure: (result) => {console.log(result.error)}
        })

    }

    return <Button className={"w-full mb-2"} handleClick={() => changeSubscription({currentSubscription: subscribed})}>{subscribed ? "Unsubscribe" : "Subscribe"}</Button>
}