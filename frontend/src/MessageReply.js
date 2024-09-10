import { useStore } from "./Store";
import CreatedTimestamp from "./CreatedTimestamp";
import HTMLBearingDiv from "./HTMLBearingDiv";
import { twMerge } from "tailwind-merge";

export default function MessageReply({data, className})
{
    const user = useStore((state) => state.user);

    return (
        <div className={twMerge("mt-2", className)}>
            <div className="flex items-end">
                <CreatedTimestamp className="align-middle text-zinc-300" minutesSinceCreation={data.minutesSinceCreation} leadingText={user == data.recipient_name ? "received" : "sent"}></CreatedTimestamp>
            </div>

            <HTMLBearingDiv htmlContent={data.body} className="break-words mb-1"></HTMLBearingDiv>
            
        </div>
    )
}