import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MemoizedFeed } from "./Feed";
import { MemoizedCategoryHeader } from "./CategoryHeader";
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

    const loadFeedContent = async function(queryParams, onSuccess)
    {
        const baseRoute = subreddit ? `https://localhost:3000/r/${subreddit}/feed` : "https://localhost:3000/feed";
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }



    const [categoryData, setCategoryData] = useState(undefined);
    useEffect(() => {
        const fetchCategory = async () => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.subreddit)
                    setCategoryData(data.subreddit);
                else
                    setCategoryData(undefined);
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
            setCategoryData(undefined);
        }
    }, [subreddit])

    return (
        <div className="flex flex-col w-full px-12 overflow-y-scroll scrollbar">
            {categoryData && <MemoizedCategoryHeader headerTitle={categoryData.name} headerDescription={categoryData.description}></MemoizedCategoryHeader>}
            <div className="flex w-full">
                <Routes>
                <Route path="" element={<MemoizedFeed fetchFeedContent={useCallback(loadFeedContent, [])} validFilters={validFilters} defaultFilter={defaultFilter}></MemoizedFeed>} />
                <Route path="/post/:postId" element={<MemoizedPost />} />
                </Routes>
                {categoryData && 
                <div className="w-1/3 mt-10 ml-12 ">
                    <BoardControls></BoardControls>
                    <MemoizedSidebar sidebarContent={categoryData.sidebar}></MemoizedSidebar>
                </div>
                }
            </div>
        </div>
    )
}