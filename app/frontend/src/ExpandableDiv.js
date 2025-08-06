import { useRef, useState, useLayoutEffect } from "react";
import { useStore } from "./Store";

import { twMerge } from "tailwind-merge";

export function ExpandableDiv({className, previewClassName, expandedClassName, chevronClassName, preview, expandableContent})
{
    const [expanded, setExpanded] = useState(false);
    const theme = useStore(state => state.theme);
    const heightRef = useRef(null);
    const [contentHeight, setContentHeight] = useState("0px");

    useLayoutEffect(() => {
        if (heightRef.current) {
            setContentHeight(`${heightRef.current.scrollHeight}px`);
        }
    }, [expanded]);

    return (
        <div className={twMerge("dark:bg-dark1 bg-light1 rounded-md pb-0 dark:text-darkText1 text-lightText1", className)}>
            <div className="">
                <div className={twMerge("text-xl font-bold text-center", previewClassName)}>{preview}</div>
                
                <div ref={heightRef} className={twMerge("transition-all duration-500 ease-in-out overflow-hidden", expandableContent)}
                    style={{height: expanded ? contentHeight : "0px"}}
                >
                    {expandableContent}
                </div>
            </div>

            <div 
                className={twMerge("flex items-center justify-center py-1 dark:hover:bg-dark4 dark:active:bg-dark5 hover:rounded-b-md", chevronClassName)} 
                onClick={() => setExpanded(prev => !prev)}
            > 
                    <img 
                        src={theme == "dark" ? "/chevron-down-light.png" : "/chevron-down-dark.png"}
                        className={twMerge("size-4 transition-transform duration-400", expanded ? "-rotate-180" : "rotate-0")}
                    >
                    </img>
            </div>
        </div>
    )
}