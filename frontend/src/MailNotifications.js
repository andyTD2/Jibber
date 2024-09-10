
import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { getData } from "./utils/fetch";
import CONFIG from "./config.json"
import { useStore } from "./Store";

export default function MailNotifications({user})
{
    const messageNotifications = useStore((state) => state.messageNotifications);
    const setMessageNotifications = useStore((state) => state.setMessageNotifications);

    useEffect(() =>
    {
        getData({
            baseRoute: `${CONFIG.BASE_URL}/notifications`,
            onSuccess: (numNotifications) => {setMessageNotifications(numNotifications.numUnreadMessages)}
        })
    }, [user])

    return (
        <div className="my-auto w-5 h-5 relative">
            <Link to="/messages">
                <img src="/mail-icon-light.png" className="w-5 h-5"></img>

                {messageNotifications > 0 &&
                <div className="flex items-center justify-center rounded-full w-3 h-3 text-xs bg-red-600 text-white absolute -right-[.2rem] top-[.6rem]">
                    <span className="-mt-[.125rem]">{messageNotifications}</span>
                </div>
                }
            </Link>
        </div>

    )
}