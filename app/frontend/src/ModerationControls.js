import { useStore } from "./Store";
import { useState } from "react";
import React from "react";

import Button from "./Button";
import DropdownMenu from "./DropdownMenu";

import { twMerge } from "tailwind-merge";

export default function ModerationControls({isModerator, modActions = [], adminActions = [], className, btnClassName, btnTheme = "primary", buttonDisplayAdmin = "Admin Tools", buttonDisplayModerator = "Mod Tools"})
{
    //Check if user is a sitewide admin
    const isAdmin = useStore((state) => state.isAdmin);
    const [modMenuVisible, setModMenuVisible] = useState(false);

    if((!isAdmin || adminActions.length == 0) && (!isModerator || modActions.length == 0))
    {
        return null;
    }

    return (
        <div className={twMerge("relative", className)}>
            <Button theme={btnTheme} className={twMerge("h-6 px-2 text-xs py-0", btnClassName)}
                handleClick={(e) => {setModMenuVisible(true)}}
            >
                {isAdmin ? buttonDisplayAdmin : buttonDisplayModerator}
            </Button>
            <DropdownMenu 
                isOpen={modMenuVisible} 
                onOutsideClick={(e) => setModMenuVisible(false)}
                pos={"right-0 top-full mt-1"}
                className={"z-10 min-w-24"}
            >
                <div className="flex flex-col items-start">
                    {isAdmin && adminActions.map((action, index) => React.cloneElement(action, { key: `admin-${index}` }))}
                    {(isModerator || isAdmin) && modActions.map((action, index) => React.cloneElement(action, { key: `mod-${index}` }))}
                </div>
            </DropdownMenu>
        </div>
    )
}