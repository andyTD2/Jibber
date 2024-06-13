import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MemoizedFeed } from "./Feed";
import { MemoizedCategoryHeader } from "./CategoryHeader";
import { MemoizedSidebar } from "./Sidebar";

const validFilters = new Set(["hot", "top", "new"]);
const defaultFilter = "hot";

export default function Board()
{
    const {subreddit} = useParams();


    console.log("board render")

    const fetchFeedContent = async (queryParams, callback) => {
        let feedRoute = "https://localhost:3000/";
        if (subreddit) feedRoute += `r/${subreddit}/`;
    
        feedRoute += "feed"
        if (queryParams)
        {
            feedRoute += "?";
            for (const [key, value] of Object.entries(queryParams))
            {
                feedRoute += `${key}=${value}&`
            }
        }
        console.log(feedRoute)
        const response = await fetch(feedRoute, 
        {
            method: "GET",
            credentials: 'include'
        });
    
        if(response.ok)
        {
            let content = await (response.json());
            callback(content);
        }
    }



    const [categoryData, setCategoryData] = useState(undefined);
    useEffect(() => {
        console.log("fetching board data...")
        const fetchCategory = async () => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                setCategoryData(data.subreddit);
            }
        }
        fetchCategory();
    }, [subreddit])


    return (
        <div className="flex flex-col w-full px-12 overflow-y-scroll">
            {categoryData && <MemoizedCategoryHeader headerTitle={categoryData.name} headerDescription={categoryData.description}></MemoizedCategoryHeader>}
            <div className="flex w-full">
                <MemoizedFeed fetchFeedContent={useCallback(fetchFeedContent, [])} validFilters={validFilters} defaultFilter={defaultFilter}></MemoizedFeed>
                {categoryData && <MemoizedSidebar sidebarContent={categoryData.sidebar}></MemoizedSidebar>}
            </div>
        </div>
    )
}