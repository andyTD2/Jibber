import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getData } from "./utils/fetch";

import { useFeed, useFeedParams } from "./hooks/feed";

import { MemoizedFeed } from "./Feed";
import Button from "./Button";
import Filter from "./Filter";


const validFilters = new Set(["top", "new", "hot"]);
const defaultFilter = "new";

export default function SearchResults()
{
    const postFeedParams = useFeedParams(validFilters, defaultFilter);
    const postFeed = useFeed();
    const communitiesFeed = useFeed();
    const usersFeed = useFeed();

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q");
    const categories = searchParams.get("categories");
    const authors = searchParams.get("authors");

    const [activeTab, setActiveTab] = useState(1);

    
    useEffect(() => {
        const queryParams = {
            "q": searchQuery,
            "filter": postFeedParams.initialFilter,
            "offset": postFeedParams.initialOffset
        }

        if(categories) queryParams["categories"] = categories;
        if(authors) queryParams["authors"] = authors;

        getData({   baseRoute: `https://localhost:3000/search`,
                    queryParams,
                    onSuccess: postFeed.replaceFeed
        })

    }, [searchQuery, categories, authors])

    useEffect(() => {
        const queryParams = {"q": searchQuery}

        getData({   baseRoute: `https://localhost:3000/searchSubreddits`,
            queryParams,
            onSuccess: communitiesFeed.replaceFeed
        })

        getData({   baseRoute: `https://localhost:3000/searchUsers`,
                    queryParams,
                    onSuccess: usersFeed.replaceFeed
        })
    }, [searchQuery])

    const tabs = [postFeed, communitiesFeed, usersFeed];
    return (
        <div className="px-12 w-full overflow-y-scroll scrollbar">
            <div className="border-zinc-600 flex pt-6">
                <Button handleClick={() => setActiveTab(0)} className={`bg-zinc-600 mr-4 ${activeTab != 0 && "bg-zinc-800"}`}>POSTS</Button>
                <Button handleClick={() => setActiveTab(1)} className={`bg-zinc-600 mr-4 ${activeTab != 1 && "bg-zinc-800"}`}>COMMUNITIES</Button>
                <Button handleClick={() => setActiveTab(2)} className={`bg-zinc-600 ${activeTab != 2 && "bg-zinc-800"}`}>USERS</Button>
            </div>
            

            <div className="mt-4">Showing {tabs[activeTab].feed.items && tabs[activeTab].feed.items.length} results</div>
            <div className="border-t-2 mb-8 border-dashed border-zinc-600 flex justify-between">
            </div>


            {activeTab == 0 && 
            <>
                {postFeed.feed.items && postFeed.feed.items.length > 0 && <Filter 
                    currentFilter={postFeedParams.initialFilter} 
                    updateFilter={(newFilter) => 
                    {
                        const queryParams = {
                            "q": searchQuery,
                            "filter": newFilter,
                            "offset": 0,
                        }
            
                        if(categories) queryParams["categories"] = categories;
                        if(authors) queryParams["authors"] = authors;
                
                        getData({   baseRoute: `https://localhost:3000/search`,
                                    queryParams,
                                    onSuccess: (results) => {
                                        postFeed.replaceFeed(results);                                            
                                        postFeedParams.setFeedQueryParams({add: {"filter" : newFilter}, remove: ["page"]})
                                    }
                        })
                    }}
                    filters={Array.from(validFilters)}>
                </Filter>}
                <MemoizedFeed
                    feed={postFeed.feed}
                ></MemoizedFeed>
                {!postFeed.feed.endOfItems && <Button handleClick=
                {
                    () => {
                        const queryParams = {
                            "q": searchQuery,
                            "filter": postFeedParams.initialFilter,
                            "offset": postFeedParams.initialOffset,
                            "lastSeen": postFeed.feed.lastSeen
                        }
                
                        if(postFeed.feed.items) queryParams["offset"] += postFeed.feed.items.length
                        if(categories) queryParams["categories"] = categories;
                        if(authors) queryParams["authors"] = authors;
                
                        getData({   baseRoute: `https://localhost:3000/search`,
                                    queryParams,
                                    onSuccess: postFeed.mergeFeed
                        })
                    }
                }
                className="w-full">
                SHOW MORE
                </Button>}
            </>}

            {activeTab == 1 && 
            <>
                <MemoizedFeed
                    feed={communitiesFeed.feed}
                ></MemoizedFeed>
                {!communitiesFeed.feed.endOfItems && <Button handleClick=
                {
                    () => {
                        const queryParams = {"q": searchQuery}
                        if(communitiesFeed.feed.items) queryParams["offset"] = communitiesFeed.feed.items.length

                        getData({   baseRoute: `https://localhost:3000/searchSubreddits`,
                                    queryParams,
                                    onSuccess: communitiesFeed.mergeFeed
                        })
                    }
                }
                className="w-full">
                SHOW MORE
                </Button>}
            </>}

            {activeTab == 2 && 
            <>
                <MemoizedFeed
                    feed={usersFeed.feed}
                ></MemoizedFeed>
                {!usersFeed.feed.endOfItems && <Button handleClick=
                {
                    () => {
                        const queryParams = {"q": searchQuery}
                        if(usersFeed.feed.items) queryParams["offset"] = usersFeed.feed.items.length
                        
                        getData({   baseRoute: `https://localhost:3000/searchUsers`,
                                    queryParams,
                                    onSuccess: usersFeed.mergeFeed
                        })
                    }
                }
                className="w-full">
                SHOW MORE
                </Button>}
            </>}


        </div>
    )
}