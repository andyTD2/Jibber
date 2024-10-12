import { useEffect, useState, useCallback } from "react";
import { useParams, Route, Routes } from "react-router-dom";
import { useStore } from "./Store.js";

import FrontpageControls from "./FrontpageControls.js";
import BoardEditor from "./BoardEditor.js";
import BoardControls from "./BoardControls.js";
import CreatePost from "./CreatePost.js";
import { MemoizedFeedManager } from "./FeedManager.js";
import { MemoizedBanner } from "./Banner.js";
import { MemoizedSidebar } from "./Sidebar.js";
import { MemoizedPost } from "./Post.js";
import CreateBoard from "./CreateBoard.js";
import HTMLBearingDiv from "./HTMLBearingDiv.js";

import { getData } from "./utils/fetch.js";
import CONFIG from "./config.json"
import MetricsBanner from "./MetricsBanner.js";

const validFilters = new Set(["hot", "top", "new"]);
const defaultFilter = "hot";

export default function Board()
{
    const {subreddit} = useParams();

    const user = useStore((state) => state.user);
    const [board, setBoard] = useState(undefined);
    const [moderator, setModerator] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.subreddit)
                {
                    data.subreddit.created_at = new Date(data.subreddit.created_at);
                    setBoard(data.subreddit);
                    setModerator(data.moderator);
                    setSubscribed(data.isSubscribed);
                }
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
    }, [subreddit, user])

    const fetchFeedContent = useCallback(async function(queryParams, onSuccess)
    {
        const baseRoute = subreddit ? `https://localhost:3000/r/${subreddit}/feed` : "https://localhost:3000/feed";
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }, [subreddit])

    console.log("board render", board)
    const conditionallyRenderFrontPage = () =>
    {
        if(board)
        {
            return (
                <>
                    <MemoizedBanner bannerLink={`/r/${board.name}`}bannerTitle={board.name} bannerDescription={board.description} bannerPictureLink={board.profilePic} className={"rounded-bl-none"}>
                        <MetricsBanner 
                            metrics={{
                                        "Est.": board.created_at.toLocaleDateString('en-US', {year: 'numeric', month: 'long'}),
                                        Subscribers: board.numSubscribers,
                                        Posts: board.numPosts
                                    }}>            
                        </MetricsBanner>
                    </MemoizedBanner>
                    <div className="flex w-full">
                        <Routes>
                            <Route path="" element={<MemoizedFeedManager deps={[subreddit]} fetchFeedContent={fetchFeedContent} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={board ? true : false}></MemoizedFeedManager>} />
                            <Route path="/post/:postId" element={<MemoizedPost />} />
                            <Route path="/newPost" element={<CreatePost board={subreddit} contentCharLimit={CONFIG.MAX_LENGTH_POST_CONTENT}/>} />
                            <Route path="/edit" element={<BoardEditor moderator={moderator} board={subreddit} setBoard={setBoard} boardData={board}></BoardEditor>} />
                        </Routes>
                        <div className="w-1/3 mt-10 ml-12 ">
                            <BoardControls boardName={board.name} boardId={board.id} moderator={moderator} subscribed={subscribed} user={user} setSubscribed={setSubscribed}></BoardControls>
                            <MemoizedSidebar sidebarContent={<HTMLBearingDiv htmlContent={board.sidebar}></HTMLBearingDiv>}></MemoizedSidebar>
                        </div>
                    </div>
                </>
                )
        }
        else if (!board && !subreddit)
        {
            return  (
                <div className="flex w-full">
                    <Routes>
                        <Route path="" element={<MemoizedFeedManager deps={[subreddit]} fetchFeedContent={fetchFeedContent} validFilters={validFilters} defaultFilter={defaultFilter} hideBoardName={false}></MemoizedFeedManager>} />
                        <Route path="/createBoard" element={<CreateBoard></CreateBoard>}></Route>
                    </Routes>
                    {user && <div className="w-1/3 mt-10 ml-12 ">
                            <FrontpageControls></FrontpageControls>
                    </div>}
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