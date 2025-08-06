import {Banner} from "./Banner"
import MetricsBanner from "./MetricsBanner"
import ModerationMenuElement from "./ModerationMenuElement"
import ModerationControls from "./ModerationControls"

import { banBoard } from "./utils/moderationActions"
import { twMerge } from "tailwind-merge"

export default function BoardBanner({data, moderator, className, titleClassName})
{
    const adminActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banBoard(data.id, onSuccess)}>Ban Board</ModerationMenuElement>
    ]

    return (
        <Banner 
            key={data.id}
            className={twMerge("mb-4 rounded-md relative", className)} 
            bannerTitle={data.title}
            bannerDescription={data.description}
            bannerLink={`/b/${data.title}`}
            bannerPictureLink={data.boardPicture}
            titleClassName={titleClassName}
        >
            <MetricsBanner 
                metrics={{
                            "Est.": new Date(data.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long'}),
                            Subscribers: data.numSubscribers,
                            Posts: data.postCount
                        }}>            
            </MetricsBanner>
            <ModerationControls isModerator={moderator} adminActions={adminActions} className={"self-end absolute top-1 right-2"}></ModerationControls>
        </Banner>
    )
}