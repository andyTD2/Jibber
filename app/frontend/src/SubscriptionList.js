import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './Store';
import { getData } from "./utils/fetch"
import { twMerge } from 'tailwind-merge';

import CONFIG from "./config"

/*
    Leftbar component fetches subscription and popular boards data for the current user,
    then provides a viewable and clickable navigation list on the left side of the app
    with the appropriate boards.
*/
export default function SubscriptionList({className})
{
    const user = useStore((state) => state.user);
    const subscriptions = useStore((state) => state.subscriptions);
    const setSubscriptions = useStore((state) => state.setSubscriptions);
    const appendSubscriptions = useStore((state) => state.appendSubscriptions);
    const theme = useStore((state) => state.theme);

    /*
        Retrieve subscribed boards for this user.

        lastSeen (int, optional): The id of the last seen subscription. Used for pagination.
            Omit if retrieving the first "page" of subscriptions

        onSuccess (func, required): Callback function that fires on success. Can be used to append
            to the list of subscriptions.
    */
    const fetchSubscriptions = function({lastSeen, onSuccess})
    {
        const options = 
        {
            baseRoute: `${CONFIG.API_URL}/subscriptions`,
            onSuccess
        }
        if(lastSeen) options["queryParams"] = {lastSeen};

        getData(options);
    }


    // On intial mount and when the user changes (includes logging out), fetch subscriptions
    useEffect(() => {
        if(user) 
            fetchSubscriptions({onSuccess: (results) => setSubscriptions(results)});
        else
            setSubscriptions({items: [], endOfItems: true})
    }, [user])


    if(subscriptions.items && subscriptions.items.length > 0)
    {
        return (
            <div className={twMerge("", className)}>
                <div className='text-2xl font-bold flex items-center'><img src={theme == "dark" ? "/saved-light.png" : "/saved-dark.png"} className='size-5 mr-2'></img>Subscribed</div>
                <div className='mt-3'>
                    {subscriptions.items.map((subscription, index) => 
                    {
                        return (
                            <Link to={`/b/${subscription.title}`} key={index} className='flex items-center mt-2 hover:underline'>
                                <img className='placeholder-avatar rounded-full w-5 h-5 mr-2 object-cover shadow-light dark:shadow-lightShadow-light' src={subscription.boardPicture}></img>
                                <div className="-mt-1 overflow-x-hidden whitespace-nowrap text-ellipsis font-medium">{subscription.title}</div>
                            </Link>
                        )
                    })}
                </div>
                {!subscriptions.endOfItems && 
                    <div 
                        className='text-xs mt-3 underline hover:cursor-pointer text-zinc-700 dark:text-zinc-400'
                        onClick={() => 
                            // Fetch more subscriptions, then append them to the list.
                            fetchSubscriptions({
                                                lastSeen: subscriptions.items[subscriptions.items.length - 1].subscriptionId, 
                                                onSuccess: (results) => appendSubscriptions(results)    
                                            })
                            }
                    >Show More</div>}
            </div>
        )
    }

    return null;
}
