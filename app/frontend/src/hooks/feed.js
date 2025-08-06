import { getOffsetFromPage, validateFilter } from "../utils/queryParams";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../Store";

/*
    Calculates and returns the corresponding offset and filter values based off of url 
    search params (page, filter, time filter). Additionally, provides access to a function 
    that allows us to change the url search params.

    returns (obj): An object consisting of the following values and functions:

        initialOffset (int): The calculated offset, based off the "page" value in the url
        intialFilter (str): The validated filter keyword, based off the "filter" value in the url
        intiialTimeFilter (str): The validated timeFilter keyword, based off the "t" value in the url
        
        setFeedQueryParams(): A function that modifies the url params. See below for description

*/
export const useFeedParams = ({validFilters, defaultFilter, validTimeFilters, defaultTimeFilter}) => 
{
    const [searchParams, setSearchParams] = useSearchParams();

    //Calculate initial offset and filter based off url params
    const initialOffset = getOffsetFromPage(searchParams.get("page"), 20);
    const initialFilter = validateFilter(searchParams.get("filter"), validFilters) || defaultFilter;
    const initialTimeFilter = validateFilter(searchParams.get("t"), validTimeFilters) || defaultTimeFilter;

    const navigate = useNavigate();

    /*
        Makes modifications to the url search params.

        add (obj, optional): An object containing url params to add. Uses the following format:

            {
                "keyOfURLParam": "valueOfURLParam"
            }

        remove ([str], optional): Array of URL Param keys to remove.
    */
    const setFeedQueryParams = ({add, remove}) =>
    {
        const curSearchParams = new URLSearchParams(searchParams)
        if(add)
            Object.keys(add).forEach(key => curSearchParams.set(key, add[key]));
        if(remove)
            remove.forEach(param => curSearchParams.delete(param))

        navigate(`?${curSearchParams.toString()}`, { replace: true });
    }

    return {initialOffset, initialFilter, initialTimeFilter, setFeedQueryParams, searchParams};
}
 

/*
    Manages a the state of a generic content feed. Provides functions to modify the feed,
    such as modifying an item in the feed, merging two feeds, and replacing a feed.

    options (obj, optional): Options object to pass to the function. Currently only supports
        an optional calculateLastSeenFn callback, which is used find the "last" item in a feed;
        useful for pagination.

    return (obj): An object with some useful functions related to the feed. See below for descriptions.
*/
export const useFeed = (options) =>
{
    const { calculateLastSeenFn } = options || {};

    //Might not be used. Depends on whether the or not an existing feed is passed into the hook
    const [internalFeed, setInternalFeed] = useState({});

    let feed = internalFeed;
    let setFeed = setInternalFeed;

    const user = useStore(state => state.user);

    if(options && options.savedFeed && options.setSavedFeed)
    {
        feed = options.savedFeed;
        setFeed = options.setSavedFeed
    }

    /*
        Modify one specific item within a feed.

        existingItemId (int, required): The id of the item within the feed to modify
        newData (obj, required): The new data of the object to modify. Conflicting values with
            be overwritten, and non conflicting items with be appended
    */
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

    /*
        Merge two feeds. Updates the current feed with a unified version of these feeds.

        mergeFrom (obj, required): Another feed object. 
    */
    const mergeFeed = (mergeFrom) =>
    {
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

            if(calculateLastSeenFn)
                mergeFrom.lastSeen = calculateLastSeenFn(mergeFrom.items);

            newFeed = {...newFeed, ...mergeFrom};
            return newFeed;
        })
    }

    /*
        Replace current feed with a new feed.

        newFeed (obj, required): A feed object that will replace the current feed.
    */
    const replaceFeed = (newFeed) =>
    {
        newFeed.itemMap = new Map();
        newFeed.items.map(item => newFeed.itemMap.set(item.id, item));

        if(calculateLastSeenFn)
            newFeed.lastSeen = calculateLastSeenFn(newFeed.items);

        setFeed(newFeed)
    }

    /*
        Checks if the feed for the current URL should be restored.
        Expected behaviour is for feeds to restore when the user navigates to the saved url 
        with the "back" button, but NOT when the user navigates to the same url through 
        other methods(by clicking a link, or typingin the url). In the event of the latter, 
        the feed should not be restored.
    */
    const feedShouldBeRestored = () =>
    {
        return (
            options.savedFeed && options.setSavedFeed //If component is supposed to used saved feeds and
            && feed.items //If the feed has items in it (not empty) and
            && window.location.href == feed.feedURL //If the current url matches the url of the saved feed
            && window.history.state && window.history.state.restore //If history object for current url has restore set to true
            && feed.savedUser == user //Only restore if user is the same user who initially saved
        )
    }

    /*
        Flags the component to restore the feed when the current URL is visited
        via history (navigating to the same URL otherwise won't work). Can be thought of
        as effectively "saving" the feed.
    */
    const saveFeed = () => 
    {
        const currentState = window.history.state || {};
        const newState = {
            ...currentState,
            restore: true,
        };
    
        // Update the current history state without changing the URL
        window.history.replaceState(newState, document.title);
        setFeed(prev => ({...prev, feedURL: window.location.href, savedUser: user}));
    }

    return (
        options && options.savedFeed && options.setSavedFeed 
        ? {feed, setFeed, modifyFeedItem, mergeFeed, replaceFeed, feedShouldBeRestored, saveFeed}
        : {feed, setFeed, modifyFeedItem, mergeFeed, replaceFeed}
    )
}