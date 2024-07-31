import { useState, createRef, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export default function Searchbar()
{
    const navigate = useNavigate();

    const parseQuery = (query) =>
    {
        const filters = findFiltersFromQuery(["in", "by"], query);
        setCategoryFilters(prev => appendFilterList(structuredClone(prev), filters.in));
        setUserFilters(prev => appendFilterList(structuredClone(prev), filters.by));
        setQuery(deleteFilterFromQuery(["in", "by"], query));
    }

    const [categoryFilters, setCategoryFilters] = useState(new Set());
    const [userFilters, setUserFilters] = useState(new Set());
    const [filterMenuVisible, setFilterMenuVisibility] = useState(false);
    const [query, setQuery] = useState("");

    const submitForm = (e) => 
    {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get("searchQuery")

        navigate(`/search/?q=${query}`);
    }

    const containerRef = useRef(null);

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setFilterMenuVisibility(false);
        }
      };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    const location = useLocation();
    useEffect(() => 
    {
        setQuery("");
        setUserFilters(new Set());
        setCategoryFilters(new Set());
    }, [location.pathname])


    console.log("SEARCH BAR RENDER")
    return (
        <div className="flex">
            <div className="mt-1 h-min flex flex-col" id="searchbar" ref={containerRef}>
                <form onSubmit={submitForm} id="searchForm">

                    <input 
                        className="w-[500px] h-7 box-border text-black rounded-lg pl-2 outline-none bg-zinc-500 focus:bg-zinc-400 hover:bg-zinc-400 placeholder:text-black" 
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
                {filterMenuVisible && (categoryFilters.size > 0 || userFilters.size > 0) &&
                    <div className="relative w-[500px] bg-zinc-500 mt-[.1rem] p-2 rounded-lg z-10">

                        {categoryFilters.size > 0 && 
                            <div className="flex">
                                <div>IN:</div>    
                                {[...categoryFilters].map((value) => 
                                    <div className="ml-3 rounded-xl bg-zinc-400 px-2 flex items-center">{value} 
                                        <img src="/close.png" className="ml-2 mt-[1px] h-3 w-3 hover:bg-zinc-100"
                                            onClick={() => setCategoryFilters(prev => 
                                            {
                                                const newFilters = structuredClone(prev);
                                                newFilters.delete(value);
                                                return newFilters;
                                            })}   
                                        ></img>
                                    </div>)}
                            </div>
                        }

                        {userFilters.size > 0 &&
                            <div className="flex mt-2">
                                <div>BY:</div>    
                                {[...userFilters].map((value) => 
                                <div className="ml-3 rounded-xl bg-blue-300 px-2 flex items-center">{value}
                                    <img src="/close.png" className="ml-2 mt-[1px] h-3 w-3 hover:bg-zinc-100"
                                        onClick={() => setUserFilters(prev => 
                                            {
                                                const newFilters = structuredClone(prev);
                                                newFilters.delete(value);
                                                return newFilters;
                                            })}  
                                    ></img>
                                </div>)}
                            </div>
                        }

                    </div>
                }
            </div>
            <input 
                className="h-7 w-7 mt-1" 
                type="image" 
                src="/search.png" 
                alt="Submit Search"
                form="searchForm"
            />
        </div>
    )
}