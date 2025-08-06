import { useState } from "react";
import { useSearchParams, useNavigate, Route, Routes, useLocation } from "react-router-dom";
import { useTitle } from "./hooks/useTitle";
import { useStore } from "./Store";
import { useScroll } from "./hooks/useScroll";

import { getData } from "./utils/fetch";

import Button from "./Button";
import FeedManager from "./FeedManager";

import CONFIG from "./config";


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
    Search results sends a search request to the server based off the url params (search query 
    and search filters). Organizes the results into separate tabs (posts, boards, users), each with
    their own feeds.
*/
export default function SearchResults()
{
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q");
    const categories = searchParams.get("categories");
    const authors = searchParams.get("authors");
    useTitle(`Search: ${searchQuery}`)

    const savedFeed = useStore(state => state.savedFeed);
    const setSavedFeed = useStore(state => state.setSavedFeed);

    const [activeTab, setActiveTab] = useState(0);
    const [numResults, setNumResults] = useState(0);

    const location = useLocation();
    const {scrollRef, restoreScrollPos} = useScroll();

    //Restore numResults state when corresponding feed is also restored
    const handleRestore = (feed) =>
    {
        restoreScrollPos();
        if(feed.items)
            setNumResults(feed.items.length);
    }

    /*
        Fetch post search feed from server.

        queryParams (obj, required): Query params that dictate the search query.
            Must include "q" at the minimum, which is the key for the search query.

        onSuccess (func, optional): Callback that triggers on successful fetch
    */
    const fetchPostContent = (queryParams, onSuccess) =>
    {
        queryParams["q"] = searchQuery;

        if(categories) queryParams["categories"] = categories;
        if(authors) queryParams["authors"] = authors;

        getData({   baseRoute: `${CONFIG.API_URL}/search`,
                    queryParams,
                    onSuccess: (results) => 
                    {
                        onSuccess(results); 
                        setNumResults(results.items.length);
                        if(activeTab != 0) setActiveTab(0);
                    }
        })
    }

    /*
        Fetch board search feed from server.

        queryParams (obj, required): Query params that dictate the search query.
            Must include "q" at the minimum, which is the key for the search query.

        onSuccess (func, optional): Callback that triggers on successful fetch
    */
    const fetchBoardContent = (queryParams, onSuccess) =>
    {
        queryParams["q"] = searchQuery;
        getData({   baseRoute: `${CONFIG.API_URL}/searchBoards`,
            queryParams,
            onSuccess: (results) => 
            {
                onSuccess(results); 
                setNumResults(results.items.length);
                if(activeTab != 1) setActiveTab(1);
            }
        })
    }

    /*
        Fetch user search feed from server.

        queryParams (obj, required): Query params that dictate the search query.
            Must include "q" at the minimum, which is the key for the search query.

        onSuccess (func, optional): Callback that triggers on successful fetch
    */
    const fetchUserContent = (queryParams, onSuccess) =>
    {
        queryParams["q"] = searchQuery;
        getData({   baseRoute: `${CONFIG.API_URL}/searchUsers`,
            queryParams,
            onSuccess: (results) => 
            { 
                onSuccess(results); 
                setNumResults(results.items.length);
                if(activeTab != 2) setActiveTab(2);
            }
        })
    }

    return (
        <div className="firefox:lg:pr-3 firefox:md:pr-2 md:px-2 lg:px-3 lg:pr-1 md:pr-0 px-12 w-full overflow-y-scroll dark:text-darkText1 text-lightText1" ref={scrollRef}>
            <div className="border-zinc-600 xs:justify-between flex flex-wrap-reverse pt-6 gap-y-2">
                <Button handleClick={() => {setActiveTab(0); navigate(`/search/posts?${searchParams.toString()}`, { replace: true });}} className={`xxs:text-sm xxs:px-5 dark:bg-dark5 bg-light4 mr-4 xs:mr-3 xxs:mr-2 ${activeTab != 0 && "dark:bg-dark3 bg-light1"}`}>POSTS</Button>
                <Button handleClick={() => {setActiveTab(1); navigate(`/search/boards?${searchParams.toString()}`, { replace: true });}} className={`xs:hidden dark:bg-dark5 bg-light4 mr-4 ${activeTab != 1 && "dark:bg-dark3 bg-light1"}`}>COMMUNITIES</Button>
                <Button handleClick={() => {setActiveTab(1); navigate(`/search/boards?${searchParams.toString()}`, { replace: true });}} className={`hidden xxs:px-5 xs:block xxs:text-sm dark:bg-dark5 bg-light4 mr-4 xs:mr-3 xxs:mr-2 ${activeTab != 1 && "dark:bg-dark3 bg-light1"}`}>BOARDS</Button>
                <Button handleClick={() => {setActiveTab(2); navigate(`/search/users?${searchParams.toString()}`, { replace: true });}} className={`xxs:text-sm xxs:px-5 dark:bg-dark5 bg-light4 ${activeTab != 2 && "dark:bg-dark3 bg-light1"}`}>USERS</Button>
            </div>
            

            <div className="mt-4">Showing {numResults} results for <span className="font-semibold italic">"{searchQuery}"</span></div>
            <div className="border-t-2 mb-8 sm:mb-2 border-dashed border-zinc-600 flex justify-between">
            </div>

            <Routes key={location.key}>
                <Route path="/posts" element={  <FeedManager
                                                    hideFilter={activeTab != 0} 
                                                    deps={[searchQuery, categories, authors, activeTab]} 
                                                    fetchFeedContent={fetchPostContent} 
                                                    savedFeed={savedFeed}        
                                                    setSavedFeed={setSavedFeed}
                                                    validFilters={validFilters} 
                                                    defaultFilter={defaultFilter} 
                                                    validTimeFilters={validTimeFilters} 
                                                    defaultTimeFilter={defaultTimeFilter}
                                                    onRestore={handleRestore}
                                                >
                                                </FeedManager>} />
                <Route path="/boards" element={  <FeedManager
                                                    hideFilter={true} 
                                                    deps={[searchQuery, categories, authors, activeTab]} 
                                                    fetchFeedContent={fetchBoardContent} 
                                                    savedFeed={savedFeed}        
                                                    setSavedFeed={setSavedFeed} 
                                                    onRestore={handleRestore}
                                                >
                                                </FeedManager>} />
                <Route path="/users" element={  <FeedManager
                                                    hideFilter={true} 
                                                    deps={[searchQuery, categories, authors, activeTab]} 
                                                    fetchFeedContent={fetchUserContent} 
                                                    savedFeed={savedFeed}        
                                                    setSavedFeed={setSavedFeed} 
                                                    onRestore={handleRestore}
                                                >
                                                </FeedManager>} />
            </Routes>


        </div>
    )
}