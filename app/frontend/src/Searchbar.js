import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./Store";
import { useOutsideClick } from "./hooks/useOutsideClick";

/*
    Uses regex to extract filters from user input. The extracted text
    is defined by a prefex followed by `:`. For example `by:my-author`

    filterPrefixes ([str], required): Array of prefixes to look for
    query (str, required): The input to search through

    return (obj): An object containing the filters and their value(s)
*/
const findFiltersFromQuery = (filterPrefixes, query) =>
{
    let filterValues = {};
    for(let prefix of filterPrefixes)
    {
        const regex = new RegExp(`\\b${prefix}:(\\S+)\\s`, 'g');
        const matchesIterator = query.matchAll(regex);
        const matches = [...matchesIterator];

        filterValues[prefix] = new Set();

        for (let match of matches)
        {
            filterValues[prefix].add(match[1]);
        }
    }
    return filterValues;
}

/*
    Deletes filter keywords from user input. The deleted filters have a keyword
    followed by `:`.

    filterPrefixes ([str], required): Array of prefixes to delete
    query (str, required): The input to search through

    return (str): a string of the query with all filter keywords and their values deleted
*/
const deleteFilterFromQuery = (filterPrefixes, query) =>
{
    let newQuery = query;
    for(let prefix of filterPrefixes)
    {
        const regex = new RegExp(`\\b${prefix}:(\\S+)\\s`, 'g');
        newQuery = newQuery.replace(regex, '');
    }
    return newQuery;
}

/*
    For each value in appendFrom, add it to appendTo

    appendFrom (set, required): Set of values to append from
    appendTo (set, required): Set of values to append to

    return (set): appendTo, with any additional values
*/
const appendFilterList = (appendFrom, appendTo) =>
{    
    appendFrom.forEach((value) => 
    {
        if(!appendTo.has(value))
        {
            appendTo.add(value);
        }
    })
    return appendTo;
}

/*
    Searchbar component accepts user queries. Users can filter their search results by author
    or board category using in: or by: filter keywords. Any active filters are displayed by the
    filter menu, and can be deleted by the user. Submitting a search query redirects the user to
    the SearchResults component, which will request a search query from the backend.
*/
export default function Searchbar()
{
    const navigate = useNavigate();
    const theme = useStore(state => state.theme);

    /*
        Parses user input of the search bar. Extracts filters (in and by keywords),
        and places them into their corresponding state variables. Sets the search query
        with filter keywords removed.

        query (str, required): The user's searchbar input
    */
    const parseQuery = (query) =>
    {
        const filters = findFiltersFromQuery(["in", "by"], query);
        setCategoryFilters(prev => appendFilterList(filters.in, structuredClone(prev)));
        setUserFilters(prev => appendFilterList(filters.by, structuredClone(prev)));
        setQuery(deleteFilterFromQuery(["in", "by"], query));
    }

    const [categoryFilters, setCategoryFilters] = useState(new Set());
    const [userFilters, setUserFilters] = useState(new Set());
    const [filterMenuVisible, setFilterMenuVisibility] = useState(false);
    const [query, setQuery] = useState("");

    /*
        Sets the correct url params, then navigates to the search results page.
        Search results page will use the information encoded in the url to communicate
        with the server. Nothing is submitted to the server in THIS component.
    */
    const submitForm = (e) => 
    {
        e.preventDefault();

        let url = `/search/posts?q=${query}`
        if(categoryFilters.size > 0)
            url += `&categories=${[...categoryFilters].toString()}`
        if(userFilters.size > 0)
            url += `&authors=${[...userFilters].toString()}`

        navigate(url);
    }
    
    const containerRef = useOutsideClick(() => setFilterMenuVisibility(false));

    const location = useLocation();

    /*
        Flush filters and queries when the url location changes.
    */
    useEffect(() => 
    {
        setQuery("");
        setUserFilters(new Set());
        setCategoryFilters(new Set());
    }, [location.pathname])


    return (
        <div className="flex justify-center w-[650px] mx-4">

            {/* containerRef is needed to check for clicks occurring outside the div */}
            <div className="h-10 flex flex-col w-full" id="searchbar" ref={containerRef}>
                {/* Query input */}
                <form onSubmit={submitForm} id="searchForm">
                    <input 
                        className="color-transition w-full text-lg h-10 box-border text-black rounded-full px-3 outline-none dark:bg-dark6 bg-altlight4 dark:focus:bg-dark7 focus:bg-altlight5 dark:hover:bg-dark7 hover:bg-altlight5 placeholder:text-black" 
                        type="text" 
                        name="searchQuery" 
                        placeholder="Search"
                        value={query}
                        onChange={(e) => 
                        {
                            parseQuery(e.target.value);
                        }}
                        onFocus={() => setFilterMenuVisibility(true)}
                    />
                </form>

                {/* Filter Menu */}
                {filterMenuVisible && (categoryFilters.size > 0 || userFilters.size > 0) &&
                    <div className="relative flex flex-col gap-1 w-full bg-zinc-500 mt-[.1rem] p-2 rounded-lg z-10">

                        {/* Renders a list of category filters */}
                        {categoryFilters.size > 0 && 
                            <div className="flex">
                                <div className="text-white">IN:</div>   
                                <div className="flex gap-y-1 flex-wrap overflow-hidden"> 
                                    {[...categoryFilters].map((value) => 
                                        <div key={value} className="ml-3 rounded-xl text-black bg-zinc-300 px-2 flex items-center overflow-x-hidden">
                                            <div className="overflow-x-hidden">{value}</div>
                                            <img src="/close.png" className="ml-2 mt-[1px] h-3 w-3 hover:bg-zinc-100"

                                                // Delete the filter if clicking on the close button
                                                onClick={() => setCategoryFilters(prev => 
                                                {
                                                    const newFilters = structuredClone(prev);
                                                    newFilters.delete(value);
                                                    return newFilters;
                                                })}   
                                            ></img>
                                        </div>)}
                                </div>
                            </div>
                        }

                        {/* Renders a list of user filters */}
                        {userFilters.size > 0 &&
                            <div className="flex">
                                <div className="text-white">BY:</div>   
                                <div className="flex gap-y-1 flex-wrap overflow-hidden"> 
                                    {[...userFilters].map((value) => 
                                        <div key={value} className="ml-3 rounded-xl text-black bg-zinc-300 px-2 flex items-center overflow-x-hidden">
                                            <div className="overflow-x-hidden">{value}</div>
                                            <img src="/close.png" className="ml-2 mt-[1px] h-3 w-3 hover:bg-zinc-100"
                                                
                                                // Delete the filter if clicking on the close button
                                                onClick={() => setUserFilters(prev => 
                                                {
                                                    const newFilters = structuredClone(prev);
                                                    newFilters.delete(value);
                                                    return newFilters;
                                                })}   
                                            ></img>
                                        </div>)}
                                </div>
                            </div>
                        }

                    </div>
                }
            </div>
            <input 
                className="size-9 ml-1 self-center" 
                type="image" 
                src={theme == "dark" ? "/search-light.png" : "/search-dark.png" }
                alt="Submit Search"
                form="searchForm"
            />
        </div>
    )
}