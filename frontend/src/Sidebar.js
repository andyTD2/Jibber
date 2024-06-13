import { memo } from "react";

export function Sidebar({sidebarContent})
{
    return (
        <div className="bg-zinc-950 mt-10 ml-12 w-1/3 rounded-md p-3">
            {sidebarContent}
        </div>
    )
}

export const MemoizedSidebar = memo(Sidebar);