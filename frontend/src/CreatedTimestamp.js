import { twMerge } from "tailwind-merge";

export default function CreatedTimestamp({minutesSinceCreation, children, className})
{
    let createdDate = ""
    const timeInMinutes = parseInt(minutesSinceCreation);
    if (timeInMinutes < 1) createdDate = "less than 1 minute ago";
    else if (timeInMinutes < 60) createdDate = `${timeInMinutes} minutes ago`;
    else if (timeInMinutes < 1440) createdDate = `${Math.floor(timeInMinutes / 60)} hours ago`;
    else if (timeInMinutes < 43200) createdDate = `${Math.floor(timeInMinutes / 1440)} days ago`;
    else if (timeInMinutes < 518400) createdDate = `${Math.floor(timeInMinutes / 43200)} months ago`;
    else createdDate = `${Math.floor(timeInMinutes / 518400)} years ago`;
    
    return(
        <div className={twMerge("text-xs", className)}>posted {createdDate} {children}</div>
    )
}