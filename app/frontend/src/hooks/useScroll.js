import { useEffect, useRef } from "react";

import { debounce } from "../utils/debounce";

/*
    This hook is used to save and restore scroll positions by appending scroll
    data to the browser's history api. It also provides the ability to scroll
    to the top of any component.

    debounceDelayMs (int, optional, default: 500): Interval for which each scroll
        event is saved. Lower numbers might be inefficient (many writes to history).
        Unit is millisecond. Default value is 500ms (half a second)
*/
export const useScroll = (debounceDelayMs = 500) => {
    // This ref is assigned to any component
    const scrollRef = useRef(null);
    
    /*
        Scroll the component to the x/y position.

        x (int, required): x/scrollLeft position to scroll to
        y (int, required): y/scrollTop position to scroll to
    */
    const scrollTo = (x, y) =>
    {
        if (scrollRef.current)
        {
            scrollRef.current.scrollTo(x, y);
        }
    }


    /*
        Saves current scroll position by writing data to current history entry.
    */
    const saveScrollPos = () =>
    {
        if(!scrollRef.current)
        {
            return
        }

        const currentState = window.history.state || {};
        const newState = {
            ...currentState,
            savedScrollPos: {
                                x: scrollRef.current.scrollLeft,
                                y: scrollRef.current.scrollTop,
                            }
        }

        window.history.replaceState(newState, document.title);
    }

    /*
        Scrolls to the saved scroll position, but only if a scroll position
        is saved in the browser history.
    */
    const restoreScrollPos = (scrollToTopOnFail = true) =>
    {
        if(!scrollRef.current)
        {
            return;
        }

        if (window.history.state && window.history.state.savedScrollPos)
        {
            scrollTo(window.history.state.savedScrollPos.x, window.history.state.savedScrollPos.y);
        }
        else if (scrollToTopOnFail)
        {
            scrollTo(0, 0);
        }
    }

    /*
        Debounces the saveScroll function so that it doesn't pull unnecessary resources.
        Then adds an event listener that calls the function when scroll event is triggered.
    */
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if(scrollElement)
        {
            const debouncedSaveScrollPos = debounce(saveScrollPos, debounceDelayMs);
            scrollElement.addEventListener("scroll", debouncedSaveScrollPos);

            return () => scrollElement.removeEventListener("scroll", debouncedSaveScrollPos);
        }
    }, []);

    return {scrollRef, scrollTo, restoreScrollPos};
  };