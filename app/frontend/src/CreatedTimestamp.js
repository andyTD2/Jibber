import { twMerge } from "tailwind-merge";

/*
    This component is responsible for transforming time since creation (in minutes) 
    into more user friendly text

    leadingText (str, optional, default: "posted"): Leading text that displays before main text
        (ie. "posted 24 hours ago", "commented 24 hours ago")

    minutesSinceCreation (int, required): Time elapsed since created, in minutes
    children (ReactNode, optional): Additional react nodes that can be rendered at the end
    className (str, optional): optional or additional styling
*/

export default function CreatedTimestamp({leadingText = "posted", minutesSinceCreation, children, className})
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
        <div className={twMerge("text-xs", className)}>{leadingText} {createdDate} {children}</div>
    )
}