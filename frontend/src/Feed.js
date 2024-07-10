import { useSearchParams } from "react-router-dom";
import { useEffect, memo } from "react"
import { useStore } from "./Store";
import { useRef } from "react";

import Filter from "./Filter";

import ContentItem from "./ContentItem"
import ButtonSmallRound from "./ButtonSmallRound"

export function Feed({fetchFeedContent, validFilters, defaultFilter})
{
    const user = useStore((state) => state.user);
    const setFeedContent = useStore((state) => state.setFeedContent);
    const appendFeedContent = useStore((state) => state.appendFeedContent);
    const feedContent = useStore((state) => state.feedContent);

    const [searchParams, setSearchParams] = useSearchParams();
    let currentFilter = useRef(defaultFilter);
    const currentPage = useRef(1);

    console.log("feed render")
    useEffect(() => {
        currentPage.current = searchParams.get("page");
        currentPage.current = isNaN(currentPage.current) || currentPage.current == null ? 1 : parseInt(currentPage.current);

        if(searchParams.get("filter") != null)
        {
            currentFilter.current = validFilters.has(searchParams.get("filter").toLowerCase()) ? 
                                        searchParams.get("filter").toLowerCase() : 
                                        currentFilter.current;
        }

        fetchFeedContent(
                            {
                                "filter" : currentFilter.current,
                                "page" : currentPage.current
                            },   
                            (posts) => {currentPage.current += 1; setFeedContent(posts)});
                        
    }, [user, searchParams]);

    return(
        <div id="feed-container" className="w-full">
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
                filters={Array.from(validFilters)}>
            </Filter>
            <div id="feed" className="min-h-full flex flex-col">
                {
                    feedContent &&
                    feedContent.map((contentItem) => <ContentItem key={contentItem.id} contentItem={contentItem}></ContentItem>)
                }
            </div>
            <ButtonSmallRound theme="dark" handleClick={
                () => {
                    fetchFeedContent(
                        {
                            "filter": currentFilter.current,
                            "page": currentPage.current
                        }, 
                        (posts) => 
                        {
                            if (posts.length > 0)
                            {
                                appendFeedContent(posts)
                                currentPage.current += 1;
                            }
                        }
                    )
                }
            } 
            className="w-full">SHOW MORE</ButtonSmallRound>
        </div>
    )
}

export const MemoizedFeed = memo(Feed);