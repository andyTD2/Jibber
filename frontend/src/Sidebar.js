import { memo } from "react";

export function Sidebar({sidebarContent})
{
    return (
        <div className="bg-zinc-950 rounded-md p-3 min-h-[48rem] w-80 break-all">
            {sidebarContent}
        </div>
    )
}

export const MemoizedSidebar = memo(Sidebar);