
import { useEffect } from "react"
import { Link } from "react-router-dom";
import { getData } from "./utils/fetch";
import { useStore } from "./Store";
import { twMerge } from "tailwind-merge";
import CONFIG from "./config"

/*
    Displays a clickable mail icon that redirects the user to their message dashboard.
    Also retrieves and displays any message notifications (amount of unread messages).

    className (str, optional): additional/optional styling
    user (obj, required): current user
*/

export default function MailNotifications({className, size, user, counterClassName, children, onClick})
{
    const messageNotifications = useStore((state) => state.messageNotifications);
    const setMessageNotifications = useStore((state) => state.setMessageNotifications);

    const theme = useStore((state) => state.theme);

    /*
        Retrieve current amount of notifications from the server and updates the amount accordingly.
    */
    useEffect(() =>
    {
        getData({
            baseRoute: `${CONFIG.API_URL}/notifications`,
            onSuccess: (numNotifications) => {setMessageNotifications(numNotifications.numUnreadMessages)}
        })
    }, [user])

    return (
        <Link to="/messages" className={twMerge("flex items-center hover:bg-altlight3 dark:hover:bg-dark3 hover:cursor-pointer", className)} onClick={onClick}>
            <div className="relative">
                <img src={theme == "dark" ? "/mail-icon-light.png" : "/mail-icon-dark.png" } className={twMerge("size-9", size)}></img>

                {messageNotifications >= 0 &&
                <div className={twMerge("flex items-center justify-center rounded-full w-[.9rem] h-[.9rem] text-xs bg-red-600 text-white absolute right-[-.4rem] top-[-.1rem]", counterClassName)}>
                    <span className="-mt-[.125rem]">{messageNotifications}</span>
                </div>
                }
            </div>
            {children}
        </Link>

    )
}