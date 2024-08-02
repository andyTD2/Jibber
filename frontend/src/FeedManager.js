import { useEffect, memo } from "react";
import { useStore } from "./Store";
import { useFeed, useFeedParams } from "./hooks/feed";


import Button from "./Button";
import Filter from "./Filter";
import { MemoizedFeed } from "./Feed";


export default function FeedManager({hideBoardName, hideUserName, defaultFilter, validFilters, fetchFeedContent, deps})
{
    const {initialOffset, initialFilter, setFeedQueryParams} = useFeedParams(validFilters, defaultFilter);
    const {feed, modifyFeedItem, mergeFeed, replaceFeed} = useFeed();

    const user = useStore((state) => state.user);

    useEffect(() => {
        console.log("useeffect triggered")
        fetchFeedContent(
                            {
                                "filter" : initialFilter,
                                "offset" : initialOffset
                            },   
                            replaceFeed  
                        );
                        
    }, [user, ...deps]);

    console.log("feed manager render");
    return (
        <div id="feed-container" className="w-full">

            <Filter 
                currentFilter={initialFilter} 
                updateFilter={(newFilter) => {
                    fetchFeedContent({  "filter": newFilter, offset: 0},
                                        (results) => {
                                            replaceFeed(results);                                            
                                            setFeedQueryParams({add: {"filter" : newFilter}, remove: ["page"]})
                                        }
                    );
                }}
                filters={Array.from(validFilters)}>
            </Filter>

            <MemoizedFeed feed={feed} handleItemVote={modifyFeedItem} hideBoardName={hideBoardName} hideUserName={hideUserName}></MemoizedFeed>

            {!feed.endOfItems && <Button handleClick=
            {
                () => {
                    fetchFeedContent(
                        {
                            "filter": initialFilter,
                            "offset": initialOffset + feed.items.length,
                            "lastSeen": feed.lastSeen
                        }, 
                        mergeFeed
                    )
                }
            }
            className="w-full"
            >
            SHOW MORE
            </Button>}
        </div>
    )
}

export const MemoizedFeedManager = memo(FeedManager);