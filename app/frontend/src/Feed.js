
import { memo } from "react";

import PostHeader from "./PostHeader"
import CommentPreview from "./CommentPreview";
import BoardBanner from "./BoardBanner";
import ProfileBanner from "./ProfileBanner";

/*
    The feed component exists to render different types of content into one unified feed. It holds no
    state. 

    hideBoardName (bool, optional): set to true if you don't want to display the 
        board for which the content belongs to
    
    hideUserName (bool, optional): set to true if you don't want to display the author of the content

    feed ([obj], required): Array of content items. See each corresponding component for an idea
        of what data is required. Each item should have a type listed (ie., post, comment, profile, etc.)

    handleItemVote (func, required): A callback that defines behavior when voting on a content item. Typically
        used in the parent component to handle state.
*/

export function Feed({hideBoardName, hideUserName, feed, handleItemVote, moderator})
{
    /*
        Determines the type of content item and returns the appropriate corresponding component.

        item (obj, required): The content item being processed. See each component type for 
            the kind of props and data expected.
    */
    const renderContentPreview = (item) => 
    {
        if(!item.type || item.type == "post") //default
        {
            return (
                <PostHeader
                    key={item.id} 
                    hideBoardName={hideBoardName}
                    hideUserName={hideUserName}
                    hideContent={true}
                    data={item}
                    onVote={handleItemVote}
                    moderator={moderator}
                    className={"md:mb-2 lg:mb-3"}
                ></PostHeader>
            )
        }
        else if(item.type == "comment")
        {
            return (
                <CommentPreview
                    key={item.id}
                    hideBoardName={hideBoardName}
                    hideUsername={hideUserName}
                    data={item}
                    onVote={handleItemVote}
                    className={"md:mb-2 lg:mb-3 overflow-x-clip"}
                ></CommentPreview>
            )
        }
        else if (item.type == "board")
        {
            return (
                <BoardBanner data={item} key={item.id} moderator={moderator} className={"md:mb-2 lg:mb-3"} titleClassName="md:text-lg"></BoardBanner>
            )
        }
        else if (item.type == "profile")
        {
            return (
                <ProfileBanner data={item} key={item.id} moderator={moderator} className={"md:mb-2 lg:mb-3"} titleClassName="md:text-lg"></ProfileBanner>
            )
        }
    }


    return(
        <>
            <div id="feed" className="flex flex-col min-w-96 lg:min-w-0">
            {
                feed.items &&
                feed.items.map((item) => renderContentPreview(item))
            }
            </div>
        </>
    )
}

export const MemoizedFeed = memo(Feed);