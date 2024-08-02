import { getOffsetFromPage, validateFilter } from "../utils/queryParams";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export const useFeedParams = (validFilters, defaultFilter) => 
    {
        const [searchParams, setSearchParams] = useSearchParams();
    
        //Calculate initial offset and filter based off url params
        const initialOffset = getOffsetFromPage(searchParams.get("page"), 20);
        const initialFilter = validateFilter(searchParams.get("filter"), validFilters) || defaultFilter;
    
        const navigate = useNavigate();
    
        const setFeedQueryParams = ({add, remove}) =>
        {
            const curSearchParams = new URLSearchParams(searchParams)
            if(add)
                Object.keys(add).forEach(key => curSearchParams.set(key, add[key]));
            if(remove)
                remove.forEach(param => curSearchParams.delete(param))
    
            navigate(`?${curSearchParams.toString()}`, { replace: true });
        }
    
        return {initialOffset, initialFilter, setFeedQueryParams, searchParams};
    }
    
export const useFeed = () =>
{
    const [feed, setFeed] = useState({});

    const modifyFeedItem = (existingItemId, newData) => 
    {
        setFeed(prev => 
        {
            let newFeed = structuredClone(prev);
            Object.assign(newFeed.itemMap.get(existingItemId), newData);
            //Merge the two objects, if any data conflicts, use newData's values
            return newFeed;
        })
    }

    const mergeFeed = (mergeFrom) =>
    {
        console.log("mergeFrom", mergeFrom);
        setFeed(prev => {
            let newFeed = structuredClone(prev);
            for(let item of mergeFrom.items)
            {
                if(!newFeed.itemMap.get(item.id))
                {
                    newFeed.items.push(item);
                    newFeed.itemMap.set(item.id, item);
                }
            }
            mergeFrom.items = newFeed.items;
            mergeFrom.lastSeen = mergeFrom.items[mergeFrom.items.length - 1] && mergeFrom.items[mergeFrom.items.length - 1].id;
            newFeed = {...newFeed, ...mergeFrom};
            return newFeed;
        })
    }

    const replaceFeed = (newFeed) =>
    {
        newFeed.itemMap = new Map();
        newFeed.items.map(item => newFeed.itemMap.set(item.id, item));
        newFeed.lastSeen = newFeed.items[newFeed.items.length - 1] && newFeed.items[newFeed.items.length - 1].id;
        setFeed(newFeed)
    }

    return {feed, setFeed, modifyFeedItem, mergeFeed, replaceFeed}
}