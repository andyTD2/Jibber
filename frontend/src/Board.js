import { useEffect, useState, useCallback } from "react";
import { useParams, Route, Routes } from "react-router-dom";


import BoardControls from "./BoardControls.js";
import { MemoizedFeedManager } from "./FeedManager.js";
import { MemoizedBanner } from "./Banner.js";
import { MemoizedSidebar } from "./Sidebar.js";
import { MemoizedPost } from "./Post.js";

import { getData } from "./utils/fetch.js";

const validFilters = new Set(["hot", "top", "new"]);
const defaultFilter = "hot";

export default function Board()
{
    const {subreddit} = useParams();
    console.log("board render")

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

    const fetchFeedContent = async function(queryParams, onSuccess)
    {
        const baseRoute = subreddit ? `https://localhost:3000/r/${subreddit}/feed` : "https://localhost:3000/feed";
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }

    return (
        <div className="flex flex-col w-full px-12 overflow-y-scroll scrollbar">
            {bannerData && <MemoizedBanner bannerLink={`/r/${bannerData.name}`}bannerTitle={bannerData.name} bannerDescription={bannerData.description}></MemoizedBanner>}
            <div className="flex w-full">
                <Routes>
                <Route path="" element={<MemoizedFeedManager deps={[subreddit]} fetchFeedContent={useCallback(fetchFeedContent, [subreddit])} subreddit={subreddit} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={bannerData ? true : false}></MemoizedFeedManager>} />
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