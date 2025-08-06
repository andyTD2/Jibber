import { useStore } from "./Store";
import { twMerge } from "tailwind-merge";

import CreatedTimestamp from "./CreatedTimestamp";
import HTMLBearingDiv from "./HTMLBearingDiv";

/*
    Renders a message reply as part of a larger message thread.

    data (obj, required): Data that is required to render the reply. See src/Message.js for format.
    className (str, optional): Optional styling
*/
export default function MessageReply({data, className})
{
    const user = useStore((state) => state.user);

    return (
        <div className={twMerge("mt-2", className)}>
            <div className="flex items-end">
                <CreatedTimestamp className="align-middle dark:text-darkText2 text-lightText2" minutesSinceCreation={data.minutesSinceCreation} leadingText={user == data.recipient_name ? "received" : "sent"}></CreatedTimestamp>
            </div>

            <HTMLBearingDiv htmlContent={data.body} className="p-spacing break-words mb-1"></HTMLBearingDiv>
            
        </div>
    )
}