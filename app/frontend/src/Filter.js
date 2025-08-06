import { useState } from "react"
import { twMerge } from "tailwind-merge";


import Button from "./Button"
import DropdownMenu from "./DropdownMenu";

/*
    The Filter component provides an interface that allows users to change the filter. It uses
    a DropdownMenu component for filter selection.

    currentFilter (str, required): The currently selected filter. Typically a state variable in
        the parent component

    updateFilter (func, required): A callback function that will triggered when the user selects
        a new filter. The filter being selected is provided as an argument to the callback.

    filters (obj, required): An object representing the types of filters that can be selected.
        The keys are the keywords that will be provided to updateFilter(), and the values
        will be displayed to the user. The format is as follows:

        {
            "filter_keyword" : "display_text"
        }

    className (str, optional): Optional styling
*/

export default function Filter({currentFilter, updateFilter, filters, className})
{
    const [filterMenuVisible, setFilterMenuVisibility] = useState(false);

    return (
        <div className={twMerge("w-min relative whitespace-nowrap flex items-center color-transition mb-2", className)} >
            <Button theme="primary" className={"h-6 px-5"} handleClick={() => setFilterMenuVisibility(true)}>{currentFilter}</Button>
            <DropdownMenu isOpen={filterMenuVisible} className="w-full left-0 mt-2" onOutsideClick={() => setFilterMenuVisibility(false)}>
            {
                Object.entries(filters).map(([filter, displayName]) => {
                    if(filter != currentFilter)
                    {
                        return <div className="text-center px-2 py-1 dark:hover:bg-dark4 hover:bg-light3"
                        onClick={() => {updateFilter(filter); setFilterMenuVisibility(false)}}
                        key={filter}>{displayName}</div>
                    }
                }
            )}
            </DropdownMenu>
        </div>
    )
}