import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MemoizedFeed } from "./Feed";
import { MemoizedBanner } from "./Banner.js";
import { MemoizedSidebar } from "./Sidebar";
import { Route, Routes } from 'react-router-dom';
import Post, { MemoizedPost } from "./Post.js";
import BoardControls from "./BoardControls.js";
import { getData } from "./utils/fetch.js";

const validFilters = new Set(["hot", "top", "new"]);
const defaultFilter = "hot";

export default function Board()
{
    const {subreddit} = useParams();
    console.log("board render")


    // const processSubsequentFeedResults = function(results)
    // {
    //     results.lastSeenPost = undefined;
    //     results.lastSeenComment = undefined;

    //     for(let i = results.items.length - 1; i >= 0; i--)
    //     {
    //         if(results.items[i].type == "comment" && !results.lastSeenComment)
    //         {
    //             results.lastSeenComment = results.items[i];
    //         }
    //         else if(results.items[i].type == "post" && !results.lastSeenPost)
    //         {
    //             results.lastSeenPost = results.items[i];
    //         }

    //         if(results.lastSeenComment && results.lastSeenPost)
    //         {
    //             break;
    //         }
    //     }
    // }

    const loadFeedContent = async function(queryParams, onSuccess)
    {
        const baseRoute = subreddit ? `https://localhost:3000/r/${subreddit}/feed` : "https://localhost:3000/feed";
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }


    const [bannerData, setBannerData] = useState(undefined);
    useEffect(() => {
        const fetchCategory = async () => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.subreddit)
                    setBannerData(data.subreddit);
                else
                    setBannerData(undefined);
            }   
        }
        if(subreddit)
        {
            console.log("fetching board data...")
            fetchCategory();
        }
        else
        {
            console.log("no board data to fetch.")
            setBannerData(undefined);
        }
    }, [subreddit])

    return (
        <div className="flex flex-col w-full px-12 overflow-y-scroll scrollbar">
            {bannerData && <MemoizedBanner bannerTitle={bannerData.name} bannerDescription={bannerData.description}></MemoizedBanner>}
            <div className="flex w-full">
                <Routes>
                <Route path="" element={<MemoizedFeed fetchFeedContent={useCallback(loadFeedContent, [])} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={bannerData ? true : false}></MemoizedFeed>} />
                <Route path="/post/:postId" element={<MemoizedPost />} />
                </Routes>
                {bannerData && 
                <div className="w-1/3 mt-10 ml-12 ">
                    <BoardControls></BoardControls>
                    <MemoizedSidebar sidebarContent={bannerData.sidebar}></MemoizedSidebar>
                </div>
                }
            </div>
        </div>
    )
}