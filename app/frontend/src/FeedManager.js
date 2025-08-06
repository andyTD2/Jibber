import { useEffect, memo, useState, useRef } from "react";
import { useScrolledToBottom } from "./hooks/useScrolledToBottom"
import { useStore } from "./Store";
import { useFeed, useFeedParams } from "./hooks/feed";


import Button from "./Button";
import Filter from "./Filter";
import { MemoizedFeed } from "./Feed";
import { twMerge } from "tailwind-merge";
import ShowMore from "./ShowMore";

/*
    As the name suggests, FeedManager "manages" a feed and some related components. Its primary
    purpose is to manage filters, fetch and display feed content from the server (with correct filters),
    and provide functionality for url params as they relate to filters.

    hideFilter (bool, optional): Set to true if you don't want to use filters

    hideBoardName (bool, optional): Set to true if you don't want to display the board name for feed content

    hideUserName (bool, optional): Set to true if you don't want to display the author of each feed content item

    defaultFilter (str, required): The initial filter that should be used on mount

    defaultTimeFilter (str, required): The initial time filter that should be used when filter is set to top.
        The filter by time functionality isn't really dynamic for now. It only supports time filtering when 
        filter is set to "top". This will be fixed later

    validFilters (obj, required): Object that defines how a feed should be filtered. Each key value pair
        in the object should be of the form "filter_keyword" : "display_text". filter_keyword is what will
        be sent to the server, and display_text is what the user will see.

    validTimeFilters (obj, required): Object that defines how a feed should be filtered by time. Each key value 
        pair in the object should be of the form "filter_keyword" : "display_text". filter_keyword is what will
        be sent to the server, and display_text is what the user will see.

    fetchFeedContent (func, required): Callback that will be triggered whenever the component needs to retrieve
        feed data from the server. The function should fetch content from the server using query params provided by 
        this component. It should then trigger a callback on success. The following format is expected:

        fetchFeedContent(queryParams, onSuccess)

            queryParams (obj, required): Url query params that will be provided to fetchFeedContent. Each key
                value pair will correspond to key value pair in the url
            
            onSuccess (func, required): A function that will be provided to fetchFeedContent. This function should be
                called on success. 

    deps ([var], optional): An array of dependency variables. The useEffect hook will trigger whenever these dependencies change.
        Allows FeedManager to be updated dynamically depending on requirements of the parent component.
    
*/
export default function FeedManager({
    hideFilter, hideBoardName, hideUserName, defaultFilter, defaultTimeFilter, 
    validFilters, validTimeFilters, fetchFeedContent, deps, savedFeed, 
    setSavedFeed, onRestore, onLoad, moderator, className
    })
{
    // Hook that handles reading and writing url query params for filtering through the feed.
    // See src/hooks/feed.js for more information on filters and how this works
    const {initialOffset, initialFilter, initialTimeFilter, setFeedQueryParams} = useFeedParams({validFilters, defaultFilter, validTimeFilters, defaultTimeFilter});
        
    // Hook that returns a feed component and related functions
    // Optionally takes an existing feed to modify, or creates a new one by default
    const {feed, modifyFeedItem, mergeFeed, replaceFeed, feedShouldBeRestored, saveFeed} = useFeed({
        calculateLastSeenFn: (items) => items[items.length - 1] && items[items.length - 1].id,
        savedFeed,
        setSavedFeed
    });

    const user = useStore((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [showMoreLoading, setShowMoreLoading] = useState(false);
    const restored = useRef(false);


     /*
        Retrieves url params, then calls fetchFeedContent function to retrieve the correct feed from server.
        On success, the feed is replaced with the new feed. This effect triggers when the user changes,
        or when any of the dependencies provided in props changes.
    */
    useEffect(() => {
        let active = true;

        setLoading(true);

        if(savedFeed && setSavedFeed && feedShouldBeRestored())
        {
            if(!restored.current) // not previously restored
            {
                restored.current = true;
            }

            setLoading(false);
            return;
        }

        let params = {
            "filter" : initialFilter,
            "t": initialTimeFilter
        }
        if(!hideFilter)
        {
            params["offset"] = initialOffset
        }

        fetchFeedContent(
                            params,
                            (results) => 
                            {
                                if(active)
                                {
                                    replaceFeed(results);
                                    if (savedFeed && setSavedFeed)
                                        saveFeed();
                                }
                                setLoading(false)
                            }
                        )
                        
        return () => {
            active = false;
        }
    }, [user, ...deps]);

    // Runs when the component has finished rendering
    useEffect(() => {
        if(!loading)
        {
            if(restored.current && onRestore && typeof onRestore === 'function')
            {
                onRestore(feed);
            }
            if(onLoad && typeof onLoad === 'function')
            {
                onLoad(feed);
            }
        }
    }, [loading])

    const loadMoreContent = () => 
    {
        setShowMoreLoading(true);
        fetchFeedContent(
            {
                "filter": initialFilter,
                "t": initialTimeFilter,
                "offset": initialOffset + feed.items.length,
                "lastSeen": feed.lastSeen
            }, 
            (results) => {
                mergeFeed(results); 
                setShowMoreLoading(false);
            }
        )
    }

    const scrollRef = useScrolledToBottom({onScrolledToBottom: loadMoreContent, offset: 1000});

    if(loading)
        return (
            <div className="w-full flex items-center justify-center">
                <img className="mt-[25%] h-12 w-12"src="/spinner-light.svg"></img>
            </div>
        )

    return (
        <div id="feed-container" className={twMerge("w-full", className)}>

            {!hideFilter && feed.items && feed.items.length > 0 &&
            <div className="flex mt-2">
                <Filter 
                    currentFilter={validFilters[initialFilter]} 
                    updateFilter={
                        // fetch feed content with the new filter and a reset offset. On success, modify url params to the correct filters.
                        (newFilter) => 
                        {
                            //setLoading(true);
                        
                            fetchFeedContent({  "filter": newFilter, offset: 0},
                                                (results) => {
                                                    //setLoading(false);                                          
                                                    setFeedQueryParams({add: {"filter" : newFilter}, remove: ["page", "t"]})
                                                    replaceFeed(results);
                                                    if (savedFeed && setSavedFeed)
                                                        saveFeed();
                                                }
                            );
                        }}
                    filters={validFilters}>
                </Filter>

                {/* Second filter component exists to handle filtering by time. It's only used when the first filter
                is sorting via numVotes("top") */}
                {initialFilter == "top" &&
                    <Filter
                        className={"ml-4"}
                        currentFilter={validTimeFilters[initialTimeFilter]}
                        filters={validTimeFilters}
                        updateFilter={(newTimeFilter) => 
                        {
                            //setLoading(true);
                            fetchFeedContent({  "filter": initialFilter, "t": newTimeFilter, offset: 0},
                                                (results) => {
                                                    //setLoading(false);                                     
                                                    setFeedQueryParams({add: {"t" : newTimeFilter}, remove: ["page"]})
                                                    replaceFeed(results);  
                                                    if (savedFeed && setSavedFeed)
                                                        saveFeed();
                                                }
                            );
                        }}
                    ></Filter>
                }
            </div>
            }

            <MemoizedFeed feed={feed} handleItemVote={modifyFeedItem} hideBoardName={hideBoardName} hideUserName={hideUserName} moderator={moderator}></MemoizedFeed>

            {/* feed.endOfItems signals whether there are any remaining items in the feed. If so, we provide
            the option to load more content; otherwise, this button doesn't appear. */}
            {feed.items && !feed.endOfItems && 
                <ShowMore
                    onShowMore={loadMoreContent}
                    className="w-full bg-light1 hover:bg-light2 active:bg-light4 mb-2"
                    disabled={showMoreLoading}
                    >
                    SHOW MORE
                </ShowMore>
            }
        </div>
    )
}

export const MemoizedFeedManager = memo(FeedManager);