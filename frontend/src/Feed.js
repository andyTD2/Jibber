import { useSearchParams } from "react-router-dom";
import { useEffect, memo, useState } from "react"
import { useStore } from "./Store";
import { useNavigate } from "react-router-dom";

import { getOffsetFromPage, validateFilter } from "./utils/queryParams";

import Filter from "./Filter";
import Button from "./Button";
import PostPreview from "./PostPreview"
import CommentPreview from "./CommentPreview";

export function Feed({fetchFeedContent, validFilters, defaultFilter, hideBoardName, hideUserName, deps})
{
    //States
    const user = useStore((state) => state.user);
    const [feed, setFeed] = useState({});

    //URL param hooks
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    //Calculate initial offset and filter based off url params
    const initialOffset = getOffsetFromPage(searchParams.get("page"), 20);
    const initialFilter = validateFilter(searchParams.get("filter"), validFilters) || defaultFilter;

    console.log("feed", feed);

    useEffect(() => {
        console.log("useeffect triggered")
        fetchFeedContent(
                            {
                                "filter" : initialFilter,
                                "offset" : initialOffset
                            },   
                            (results) => {
                                console.log("feeddata", results);
                                results.itemMap = new Map();
                                results.items.map(item => results.itemMap.set(item.id, item));
                                results.lastSeen = results.items[results.items.length - 1] && results.items[results.items.length - 1].id;
                                setFeed(results)
                            });
                        
    }, [user, ...deps]);

    return(
        <div id="feed-container" className="w-full">

            <Filter 
                currentFilter={initialFilter} 
                updateFilter={(newFilter) => {
                    fetchFeedContent({  "filter": newFilter, offset: 0},
                                        (results) => {
                                            results.itemMap = new Map();
                                            results.items.map(item => results.itemMap.set(item.id, item));
                                            results.lastSeen = results.items[results.items.length - 1] && results.items[results.items.length - 1].id;
                                            setFeed(results);

                                            const curSearchParams = new URLSearchParams(searchParams)
                                            curSearchParams.set("filter", newFilter);
                                            curSearchParams.delete("page");
                                            navigate(`?${curSearchParams.toString()}`, { replace: true });
                                        }
                    );
                }}
                filters={Array.from(validFilters)}>
            </Filter>

            <div id="feed" className="flex flex-col">
            {
                feed.items &&
                feed.items.map((contentItem) => 
                    contentItem.type && contentItem.type == "comment" ? 
                    <CommentPreview
                        key={contentItem.id}
                        hideBoardName={hideBoardName}
                        hideUserName={hideUserName}
                        data={contentItem}
                        onVote={(existingItemId, newData) => 
                        {
                            setFeed(prev => 
                            {
                                let newFeed = structuredClone(prev);
                                Object.assign(newFeed.itemMap.get(existingItemId), newData);
                                //Merge the two objects, if any data conflicts, use newData's values
                                return newFeed;
                            })
                        }}
                    ></CommentPreview>
                    :
                    <PostPreview
                        key={contentItem.id} 
                        hideBoardName={hideBoardName}
                        hideUserName={hideUserName}
                        data={contentItem}
                        onVote={(existingItemId, newData) => 
                        {
                            setFeed(prev => 
                            {
                                let newFeed = structuredClone(prev);
                                Object.assign(newFeed.itemMap.get(existingItemId), newData);
                                //Merge the two objects, if any data conflicts, use newData's values
                                return newFeed;
                            })
                        }}
                    ></PostPreview>
                )
            }
            </div>

            {!feed.endOfItems && <Button handleClick=
            {
                () => {
                    fetchFeedContent(
                        {
                            "filter": initialFilter,
                            "offset": initialOffset + feed.items.length,
                            "lastSeen": feed.lastSeen
                        }, 
                        (results) => 
                        {
                            setFeed(prev => {
                                let newFeed = structuredClone(prev);
                                for(let item of results.items)
                                {
                                    if(!newFeed.itemMap.get(item.id))
                                    {
                                        newFeed.items.push(item);
                                        newFeed.itemMap.set(item.id, item);
                                    }
                                }
                                results.items = newFeed.items;
                                results.lastSeen = results.items[results.items.length - 1] && results.items[results.items.length - 1].id;
                                newFeed = {...newFeed, ...results};
                                return newFeed;
                            })
                        }
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

export const MemoizedFeed = memo(Feed);