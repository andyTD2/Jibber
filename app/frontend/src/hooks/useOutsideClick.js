import { useEffect, useRef } from "react";

/*
    This hook, when assigned to a component, triggers a function when the user clicks
    outside that component. Basically an event handler for outside clicks.

    onOutsideClick (func, required): Callback that triggers when the user clicks
        outside the component

    returns:
        containerRef (obj): Reference to apply to a container.
            usage ex: <div ref={containerRef}>

*/
export const useOutsideClick = (onOutsideClick) => {
    // This ref is assigned to any component
    const containerRef = useRef();

    /*
        Handles clicking outside the search bar. Clicking outside hides the filter menu.
    */
    const handleClickOutside = (event) => 
    {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            if (onOutsideClick) onOutsideClick();
        }
    };
    
    /*
        Add (and clean up) mousedown event listeners for checking outside clicks
    */
    useEffect(() => 
    {  
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return containerRef;
  };