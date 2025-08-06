import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Route, Routes, useLocation } from "react-router-dom";
import { useStore } from "./Store.js";
import { useTitle } from "./hooks/useTitle.js";
import { useScroll } from "./hooks/useScroll.js";

import { twMerge } from "tailwind-merge";

import FrontpageControls from "./FrontpageControls.js";
import BoardEditor from "./BoardEditor.js";
import BoardControls from "./BoardControls.js";
import CreatePost from "./CreatePost.js";
import CreateBoard from "./CreateBoard.js";
import HTMLBearingDiv from "./HTMLBearingDiv.js";
import ContentPanel from "./ContentPanel.js";
import MetricsBanner from "./MetricsBanner.js";
import { MemoizedFeedManager } from "./FeedManager.js";
import { MemoizedBanner } from "./Banner.js";
import { MemoizedSidebar } from "./Sidebar.js";
import { MemoizedPost } from "./Post.js";

import { getData } from "./utils/fetch.js";
import CONFIG from "./config.js"
import ModerationControls from "./ModerationControls.js";
import ModerationMenuElement from "./ModerationMenuElement.js";
import { banBoard } from "./utils/moderationActions.js";
import BoardBanner from "./BoardBanner.js";
import { ExpandableDiv } from "./ExpandableDiv.js";

const validFilters = {
    hot: "HOT",
    top: "TOP",
    new: "NEW"
};
const defaultFilter = "hot";

const validTimeFilters = 
{
  day: "Past Day",
  week: "Past Week",
  month: "Past Month",
  year: "Past Year",
  all: "All Time"
}
const defaultTimeFilter = "all";


/*
    Component that handles the fetching and rendering of data for a specific board 
    or the frontpage. It dynamically displays board related content such as feeds, 
    sidebars, and moderator actions based on the board's availability and user state.
*/
export default function Board()
{
    //Grab the boardName that the user navigated to
    const {boardName} = useParams();
    const {scrollRef, restoreScrollPos} = useScroll();

    //If no boardName is present, assume the user navigated to the frontpage (collection of all boards)
    useTitle(`${boardName ? boardName : "Jibber - Frontpage"}`);

    const user = useStore((state) => state.user);
    const [board, setBoard] = useState(undefined);
    const [moderator, setModerator] = useState(false);
    const [error, setError] = useState(undefined);
    const [subscribed, setSubscribed] = useState(false);
    const [sysMessage, setSysMessage] = useState({title: "", content: ""});

    const savedFeed = useStore(state => state.savedFeed);
    const setSavedFeed = useStore(state => state.setSavedFeed);

    const location = useLocation();

    const adminActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banBoard(board.id, onSuccess)}>Ban Board</ModerationMenuElement>
    ]

    /*
        Fetches the board feed consisting of a list of posts

        queryParams (obj, optional) - any url query params that should be passed to the server
        onSuccess (func, optional) - optional callback that triggers upon success
    */
    const fetchFeedContent = useCallback(function(queryParams, onSuccess)
    {
        const baseRoute = boardName ? `${CONFIG.API_URL}/b/${boardName}/feed` : `${CONFIG.API_URL}/feed`;
        getData({   baseRoute,
                    queryParams,
                    onSuccess: (results) => 
                    {
                        if(onSuccess) 
                            onSuccess(results)
                    }
        })
    }, [boardName])

    /*
        Will return JSX for either a specific board or the frontpage, depending on the status
        of the board state. Undefined/empty board states will render the frontpage.
    */
    const conditionallyRenderFrontPage = () =>
    {

        if(error)
        {
            return (
                <>
                <div className="rounded-md bg-opacity-50 text-center m-4 p-2 text-red-500 text-2xl bg-altlight7">{error}</div>
                </>
            )
        }

        if(board)
        {
            return (
                <>
                    <ExpandableDiv 
                        preview={
                            <>
                            <BoardBanner data={board} moderator={moderator} className="lg:mb-0 lg:rounded-b-none lg:pb-0 text-start" ></BoardBanner>
                            <BoardControls className="shadow-none px-2 gap-x-2 hidden lg:flex lg:flex-wrap bg-transparent dark:bg-transparent min-h-fit mb-0 rounded-none" 
                                btnClassName="w-fit lg:h-12 text-base sm:text-xs sm:px-3 mb-0" boardName={board.title} boardId={board.id} moderator={moderator} subscribed={subscribed} user={user} setSubscribed={setSubscribed}></BoardControls>
                            </>
                        }
                        expandableContent={
                            <MemoizedSidebar className={"mt-2 mx-3 px-0 border-t-[1px] border-zinc-700 rounded-none min-w-0 h-fit min-h-0 pt-4"} sidebarContent={<HTMLBearingDiv className={"p-spacing"} htmlContent={board.sidebar}></HTMLBearingDiv>}></MemoizedSidebar>
                        }
                        className={"hidden lg:block md:rounded-none"}
                        chevronClassName={"md:hover:rounded-none"}
                    >
                    </ExpandableDiv>
                    <BoardBanner data={board} moderator={moderator} className="lg:hidden text-start" ></BoardBanner>
                    <div className="flex">
                        <div className="flex-1 w-[75%]">
                            <Routes>
                                <Route path="" element={
                                    <MemoizedFeedManager 
                                        key={location.key}
                                        deps={[boardName]} 
                                        fetchFeedContent={fetchFeedContent} 
                                        validFilters={validFilters} 
                                        defaultFilter={defaultFilter} 
                                        validTimeFilters={validTimeFilters} 
                                        defaultTimeFilter={defaultTimeFilter} 
                                        hideBoardName={board ? true : false}
                                        savedFeed={savedFeed}        
                                        setSavedFeed={setSavedFeed}
                                        onRestore={restoreScrollPos}
                                        moderator={moderator}
                                    > 
                                    </MemoizedFeedManager>} 
                                />
                                <Route path="/post/:postId" element={<MemoizedPost onLoad={restoreScrollPos}/>} />
                                <Route path="/newPost" element={<CreatePost board={boardName} contentCharLimit={CONFIG.MAX_LENGTH_POST_CONTENT} onLoad={restoreScrollPos}/>} />
                                <Route path="/edit" element={<BoardEditor moderator={moderator} board={boardName} setBoard={setBoard} boardData={board} onLoad={restoreScrollPos}></BoardEditor>} />
                            </Routes>
                        </div>

                        <div className="lg:hidden mt-10 ml-12 lg:mx-0 lg:mt-4 w-72 lg:w-full">
                            <BoardControls className={"lg:hidden"} boardName={board.title} boardId={board.id} moderator={moderator} subscribed={subscribed} user={user} setSubscribed={setSubscribed}></BoardControls>
                            <MemoizedSidebar className={"lg:w-full"} sidebarContent={<HTMLBearingDiv htmlContent={board.sidebar} className={"p-spacing [&_a:visited]:text-purple-600 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:cursor-pointer"}></HTMLBearingDiv>}></MemoizedSidebar>
                        </div>
                    </div>
                </>
            )
        }
        else if (!board && !boardName)
        {
            return  (
                <div className="flex lg:flex-col">
                    <ExpandableDiv 
                        preview={sysMessage?.title} 
                        previewClassName={"pt-4 pb-2"}
                        expandableContent=
                        {
                            <MemoizedSidebar 
                                className={"mt-2 mx-3 px-0 border-t-[1px] border-zinc-700 rounded-none min-w-0 h-fit min-h-0 pt-4"} 
                                sidebarContent={<HTMLBearingDiv htmlContent={sysMessage?.content} className="p-spacing [&_a:visited]:text-purple-600 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:cursor-pointer"></HTMLBearingDiv>}>
                            </MemoizedSidebar>
                        } 
                        className={"hidden lg:block rounded-t-none"}>
                    </ExpandableDiv>

                    <div className="flex-1 w-[75%] lg:w-full">
                        <Routes>
                            <Route path="" element={<MemoizedFeedManager 
                                                        key={location.key} 
                                                        deps={[boardName]} 
                                                        fetchFeedContent={fetchFeedContent} 
                                                        validFilters={validFilters} 
                                                        defaultFilter={defaultFilter} 
                                                        validTimeFilters={validTimeFilters} 
                                                        defaultTimeFilter={defaultTimeFilter} 
                                                        hideBoardName={false} 
                                                        savedFeed={savedFeed}        
                                                        setSavedFeed={setSavedFeed}
                                                        onRestore={restoreScrollPos}>  
                                                    </MemoizedFeedManager>}
                            />
                            <Route path="/createBoard" element={<CreateBoard></CreateBoard>}></Route>
                        </Routes>
                    </div>
                    <div className="mt-10 ml-12 w-72 lg:hidden">
                            {user && <FrontpageControls></FrontpageControls>}
                            <MemoizedSidebar className={"lg:hidden"} sidebarContent={<HTMLBearingDiv className={"p-spacing"} htmlContent={`<div class="text-2xl text-center font-bold mb-4">${sysMessage?.title}</div>${sysMessage?.content}`} sanitize={false}></HTMLBearingDiv>}></MemoizedSidebar>
                    </div>
                </div>
            )
        }
    }

    //Fetch new board data on initial load, everytime the boardName url parameter changes,
    //or when the user changes (a change in user means we need to reacquire mod and subscription status)
    useEffect(() => {
        /*
            We return a cleanup func () => {active = false} at the end of the useEffect. 
            Everytime there is a render, this cleanup function runs, which sets active to false.
            When active is set to false, we no longer update the board with fetched data,
            because its stale. This prevents race conditions.
        */
        let active = true;

        /*
            Fetches all board data from server except for feed content
            Upon success, stores board data, moderator status, and subscribed status in their appropriate states
            Upon failure, sets board to undefined (frontpage)
        */
        const fetchBoard = () => 
        {
            getData({
                baseRoute: `${CONFIG.API_URL}/b/${boardName}`,
                onSuccess: (data) =>
                {
                    if(active)
                    {
                        if(data.board && active)
                        {
                            data.board.createdAt = new Date(data.board.createdAt);
                            setBoard(data.board);
                            setModerator(data.moderator);
                            setSubscribed(data.isSubscribed);
                        }
                        else
                        {
                            setBoard(undefined);
                        }
                        setError(undefined);
                    }
                },
                onFailure: (data) =>
                {
                    setBoard(undefined);
                    if(data.error)
                        setError(data.error);
                }
            });
        }

        const fetchSystemMessage = () =>
        {
            getData({
                baseRoute: `${CONFIG.API_URL}/getSystemMessage`,
                onSuccess: (message) => {
                    setSysMessage({title: message.systemMessage.title, content: message.systemMessage.content});
                    setBoard(undefined);
                }
            })
        }

        if(boardName)
        {
            fetchBoard();
        }
        else
        { 
            fetchSystemMessage();
            setError(undefined);
        }
        //cleanup fn
        return () => {
            active = false;
        }
    }, [boardName, user])

    return (
        <div className={twMerge(`flex firefox:lg:pr-3 firefox:md:pr-2 flex-col px-12 lg:px-3 lg:pr-1 md:px-2 md:pr-0 overflow-y-scroll w-full`)} ref={scrollRef}>
            {conditionallyRenderFrontPage()}
        </div>
    )
}