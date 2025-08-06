import { useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useOutsideClick } from "./hooks/useOutsideClick";

/*
    Provides a generic dropdown menu that can be used in many different components.
    State is handled by parent component

    isOpen (bool, optional, default: falsy/undefined): State from parent component. Determines whether the dropdown menu is open.

    children (ReactNode, optional): The content to be rendered inside the dropdown menu

    onOutsideClick (func, required): Callback function that will be triggered when the user clicks outside the menu.
        Typically used to handle state changes (ie., close menu on outside click)

    className (str, optional): Additional/optional styles to be applied to dropdown menu
*/

export default function DropdownMenu({isOpen, children, onOutsideClick, className, pos})
{        
    if (!pos)
    {
        pos = "top-full right-0"
    }

    const containerRef = useOutsideClick(onOutsideClick);

    if(!isOpen)
        return null;

    return (
        <div ref={containerRef} className={twMerge("color-transition dark:text-darkText1 text-lightText1 dark:bg-dark2 bg-light1 rounded-md h-min w-min absolute shadow-strong dark:shadow-lightShadow", className, pos)}>
            {children}
        </div>
    )
}