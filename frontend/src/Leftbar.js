import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {useStore} from './Store';
import {getData} from "./utils/fetch"

export default function Leftbar()
{
    const user = useStore((state) => state.user);

    const [subscriptions, setSubscriptions] = useState({items: [], endOfItems: true});
    const [popularBoards, setPopularBoards] = useState([]);

    const fetchSubscriptions = function({lastSeen, onSuccess})
    {
        console.log("lastSeen", lastSeen)
        const options = 
        {
            baseRoute: `https://localhost:3000/subscriptions`,
            onSuccess
        }
        if(lastSeen) options["queryParams"] = {lastSeen};

        getData(options);
    }

    const fetchPopularBoards = function(onSuccess)
    {
        const options = 
        {
            baseRoute: "https://localhost:3000/popularBoards",
            onSuccess
        }
        getData(options);
    }

    useEffect(() => {
        if(user) 
            fetchSubscriptions({onSuccess: (results) => setSubscriptions(results)});

        fetchPopularBoards((results) => {console.log("popular", results); setPopularBoards(results.items)});
    }, [user])


    console.log("subscriptions", subscriptions)

    let savedBoards = null;
    if(subscriptions.items && subscriptions.items.length > 0)
    {
        savedBoards = subscriptions.items.map((subscription, index) => 
            {
                return (
                    <Link to={`/r/${subscription.title}`} key={index} className='flex items-center mt-2 hover:underline'>
                        <div className='placeholder-avatar rounded-full w-5 h-5 bg-blue-500 mr-2'></div>
                        <div className="-mt-1 overflow-x-hidden whitespace-nowrap text-ellipsis">{subscription.title}</div>
                    </Link>
                )
            })
    }

    let popularBoardsHtml = null;
    if(popularBoards && popularBoards.length > 0)
    {
        popularBoardsHtml = popularBoards.map((board, index) => 
            {
                return (
                    <Link to={`/r/${board.title}`} key={index} className={`flex items-center mt-2 hover:underline`}>
                        <div className='placeholder-avatar rounded-full min-w-5 w-5 h-5 bg-blue-500 mr-2'></div>
                        <div className="-mt-1 overflow-x-hidden whitespace-nowrap text-ellipsis">{board.title}</div>
                    </Link>
                )
            })
    }

    return(
        <div className="bg-zinc-950 pl-6 pr-1 w-[200px] overflow-y-auto scrollbar-light-thin">
            {savedBoards &&
                <>
                <div className='mt-4 text-lg font-semibold'>Saved Boards</div>
                <div className='mt-2'>
                    {savedBoards}
                </div>
                {!subscriptions.endOfItems && 
                    <div 
                        className='text-xs mt-3 underline hover:cursor-pointer'
                        onClick={() => 
                            fetchSubscriptions({
                                                lastSeen: subscriptions.items[subscriptions.items.length - 1].subscriptionId, 
                                                onSuccess: (results) => setSubscriptions(prev => ({endOfItems: results.endOfItems, items: [...prev.items, ...results.items]}))    
                                            })
                            }
                    >Show More</div>}
                </>
            }
            {popularBoards &&
                <>
                <div className='mt-4 text-lg font-semibold'>Popular Boards</div>
                <div className='mt-2'>
                    {popularBoardsHtml}
                </div>
                </>
            }

        </div>
    )
}
