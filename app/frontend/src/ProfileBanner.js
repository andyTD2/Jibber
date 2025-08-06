import {Banner} from "./Banner"
import MetricsBanner from "./MetricsBanner"
import ModerationMenuElement from "./ModerationMenuElement"
import ModerationControls from "./ModerationControls"

import { banUserSitewide } from "./utils/moderationActions"

import { twMerge } from "tailwind-merge"

export default function ProfileBanner({data, moderator, className, titleClassName})
{
    const adminActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banUserSitewide(data.id, onSuccess)}>Ban User (Sitewide)</ModerationMenuElement>
    ]

    

    return (
        <Banner 
            key={data.id}
            className={twMerge("mb-8 rounded-md", className)}
            bannerTitle={data.username}
            bannerDescription={data.description}
            bannerLink={`/u/${data.username}`}
            bannerPictureLink={data.profilePicture}
            titleClassName={titleClassName}
        >
            <MetricsBanner 
                metrics={{
                            Score: data.numVotes, 
                            Joined: new Date(data.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})
                        }}>            
            </MetricsBanner>
            <ModerationControls isModerator={moderator} adminActions={adminActions} className={"self-end ml-auto"}></ModerationControls>
        </Banner>
    )
}