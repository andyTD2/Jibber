import ContentItem from "./ContentItem"
import {useEffect, useState} from "react"
import { useStore } from "./Store";
import { useParams, useSearchParams } from "react-router-dom";
import Filter from "./Filter";

export default function Feed(props)
{
    const user = useStore((state) => state.user);
    const feedContent = useStore((state) => state.feedContent);
    const setFeedContent = useStore((state) => state.setFeedContent);
    const {subreddit} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const validFilters = new Set(["hot", "top", "new"]);
    let currentFilter = searchParams.get("filter");
    currentFilter = currentFilter ? currentFilter.toLowerCase() : currentFilter;
    currentFilter = validFilters.has(currentFilter) ? currentFilter : "hot"

    let feedRoute = subreddit ? `https://localhost:3000/r/${subreddit}?filter=${currentFilter}` : 
                                `https://localhost:3000/?filter=${currentFilter}`;


    useEffect(() => {
        const getFeedContent = async (feedRoute) => {
            const response = await fetch(feedRoute, {
            method: "GET",
            credentials: 'include'
            });
            
            if(response.ok)
            {
                let posts = (await response.json()).posts;
                setFeedContent(posts)   
            }
        }
        getFeedContent(feedRoute);
    }, [user, searchParams]);

    return(
        <div id="feed-container" className="w-3/5 px-12 pt-2 overflow-y-scroll">
            <Filter 
                currentFilter={currentFilter} 
                updateFilter={(newFilter) => {setSearchParams((searchParams) => {searchParams.set("filter", newFilter); return searchParams})}}
                filters={Array.from(validFilters)}>
            </Filter>
            <div id="feed" className="h-[5000px] flex flex-col">
                {
                    feedContent &&
                    feedContent.map((contentItem) => <ContentItem key={contentItem.id} contentItem={contentItem}></ContentItem>)
                }
            </div>
        </div>
    )
}