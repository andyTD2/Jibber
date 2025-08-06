import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './Store';
import {getData} from "./utils/fetch"
import { twMerge } from 'tailwind-merge';

import CONFIG from "./config"

/*
    Leftbar component fetches subscription and popular boards data for the current user,
    then provides a viewable and clickable navigation list on the left side of the app
    with the appropriate boards.
*/
export default function PopularBoardsList({className})
{
    const [popularBoards, setPopularBoards] = useState([]);
    const theme = useStore((state) => state.theme);

    /*
        Retrieve the most current popular boards.

        onSuccess (func, required): Callback function that fires on success. Can be used to append
            to the list of subscriptions.
    */
    const fetchPopularBoards = function(onSuccess)
    {
        const options = 
        {
            baseRoute: `${CONFIG.API_URL}/popularBoards`,
            onSuccess
        }
        getData(options);
    }


    // On intial mount, fetch popular boards
    useEffect(() => {
        fetchPopularBoards((results) => setPopularBoards(results.items));
    }, [])


    if(popularBoards && popularBoards.length > 0)
    {
        return (
            <div className={twMerge("", className)}>
                <div className='text-2xl font-bold flex items-center'><img src={theme == "dark" ? "/trending-light.png" : "/trending-dark.png"} className='size-5 mr-2'></img>Popular</div>
                <div className='mt-3'>
                    {popularBoards.map((board, index) => 
                    {
                        return (
                            <Link to={`/b/${board.title}`} key={index} className={`flex items-center mt-2 hover:underline`}>
                                <img className='placeholder-avatar rounded-full w-5 h-5 mr-2 object-cover shadow-light dark:shadow-lightShadow-light' src={board.boardPicture}></img>
                                <div className="-mt-1 overflow-x-hidden whitespace-nowrap text-ellipsis font-medium">{board.title}</div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        )
        // popularBoardsHtml = popularBoards.map((board, index) => 
        //     {
        //         return (
        //             <Link to={`/b/${board.title}`} key={index} className={`flex items-center mt-2 hover:underline`}>
        //                 <img className='placeholder-avatar rounded-full w-5 h-5 mr-2 object-cover shadow-light dark:shadow-lightShadow-light' src={board.boardPicture}></img>
        //                 <div className="-mt-1 overflow-x-hidden whitespace-nowrap text-ellipsis">{board.title}</div>
        //             </Link>
        //         )
        //     })

    }
    return null;
}
