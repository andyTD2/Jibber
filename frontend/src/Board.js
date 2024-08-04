import { useEffect, useState, useCallback } from "react";
import { useParams, Route, Routes } from "react-router-dom";


import BoardControls from "./BoardControls.js";
import CreatePost from "./CreatePost.js";
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

    const [board, setBoard] = useState(undefined);
    useEffect(() => {
        const fetchCategory = async () => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.subreddit)
                    setBoard(data.subreddit);
                else
                    setBoard(undefined);
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
            setBoard(undefined);
        }
    }, [subreddit])

    const fetchFeedContent = useCallback(async function(queryParams, onSuccess)
    {
        const baseRoute = subreddit ? `https://localhost:3000/r/${subreddit}/feed` : "https://localhost:3000/feed";
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }, [subreddit])

    const conditionallyRenderFrontPage = () =>
    {
        if(board)
        {
            return (
                <>
                    <MemoizedBanner bannerLink={`/r/${board.name}`}bannerTitle={board.name} bannerDescription={board.description}></MemoizedBanner>
                    <div className="flex w-full">
                        <Routes>
                            <Route path="" element={<MemoizedFeedManager deps={[subreddit]} fetchFeedContent={fetchFeedContent} subreddit={subreddit} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={board ? true : false}></MemoizedFeedManager>} />
                            <Route path="/post/:postId" element={<MemoizedPost />} />
                            <Route path="/newPost" element={<CreatePost board={subreddit} charLimit={10000}/>} />
                        </Routes>
                        <div className="w-1/3 mt-10 ml-12 ">
                            <BoardControls board={subreddit}></BoardControls>
                            <MemoizedSidebar sidebarContent={board.sidebar}></MemoizedSidebar>
                        </div>
                    </div>
                </>
                )
        }
        else
        {
            return  (
                <div className="flex w-full">
                    <Routes>
                        <Route path="" element={<MemoizedFeedManager deps={[subreddit]} fetchFeedContent={fetchFeedContent} subreddit={subreddit} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={false}></MemoizedFeedManager>} />
                    </Routes>
                </div>
            )
        }
    }

    return (
        <div className="flex flex-col w-full px-12 overflow-y-scroll scrollbar">
            {conditionallyRenderFrontPage()}
        </div>
    )
}