import ContentItem from "./ContentItem"
import {useEffect, useState} from "react"
import { useStore } from "./Store";
import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Filter from "./Filter";

const fetchFeedContent = async (params, callback) => {
    let feedRoute = "https://localhost:3000/";
    if (params.subreddit) feedRoute += `r/${params.subreddit}`;
    if (params.queryParams)
    {
        feedRoute += "?";
        for (const [key, value] of Object.entries(params.queryParams))
        {
            feedRoute += `${key}=${value}&`
        }
    }
    
    const response = await fetch(feedRoute, {
    method: "GET",
    credentials: 'include'
    });
    
    if(response.ok)
    {
        let posts = (await response.json()).posts;
        callback(posts);
    }
}

export default function Feed(props)
{
    const validFilters = useRef(new Set(["hot", "top", "new"]));
    const currentFilter = useRef("hot");
    const currentPage = useRef(1);

    const user = useStore((state) => state.user);
    const feedContent = useStore((state) => state.feedContent);
    const setFeedContent = useStore((state) => state.setFeedContent);
    const appendFeedContent = useStore((state) => state.appendFeedContent);
    const {subreddit} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    console.log("render");

    useEffect(() => {
        currentPage.current = searchParams.get("page");
        currentPage.current = isNaN(currentPage.current) || currentPage.current == null ? 1 : parseInt(currentPage.current);

        currentFilter.current = validFilters.current.has(searchParams.get("filter").toLowerCase()) ? 
                                    searchParams.get("filter").toLowerCase() : 
                                    currentFilter.current;

        fetchFeedContent({  subreddit: subreddit, 
                            queryParams: 
                            {
                                "filter" : currentFilter.current,
                                "page" : currentPage.current
                            }
                        }, (posts) => setFeedContent(posts));
                        
    }, [user, searchParams]);

    return(
        <div id="feed-container" className="w-3/5 px-12 pt-2 overflow-y-scroll">
            <Filter 
                currentFilter={currentFilter.current} 
                updateFilter={(newFilter) => {
                    setSearchParams((searchParams) => {
                        searchParams.set("filter", newFilter);
                        searchParams.delete("page"); 
                        return searchParams
                    })
                    currentPage.current = 1;
                }}
                filters={Array.from(validFilters.current)}>
            </Filter>
            <div id="feed" className="min-h-full flex flex-col">
                {
                    feedContent &&
                    feedContent.map((contentItem) => <ContentItem key={contentItem.id} contentItem={contentItem}></ContentItem>)
                }
            </div>
            <div onClick={() => {
                currentPage.current += 1;
                fetchFeedContent({  subreddit: subreddit,
                                    queryParams: 
                                    {
                                        "filter": currentFilter.current,
                                        "page": currentPage.current
                                    }
                                }, (posts) => {appendFeedContent(posts)})
                }
            }>NEXT PAGE</div>
        </div>
    )
}