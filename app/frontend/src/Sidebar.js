import { memo } from "react";
import { twMerge } from "tailwind-merge";

/*
    Renders content into the sidebar. Sidebar components are typically used for boards or profiles.
    They contain useful information or FAQ.

    sidebarContent (ReactNode, optional): React content to render inside the sidebar
*/
export function Sidebar({sidebarContent, className})
{
    return (
        <div className={twMerge("shadow-lg color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 rounded-md p-3 min-h-[48rem] break-words", className)}>
            {sidebarContent}
        </div>
    )
}

export const MemoizedSidebar = memo(Sidebar);