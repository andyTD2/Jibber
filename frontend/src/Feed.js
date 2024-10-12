
import { memo, useCallback } from "react";
import PostPreview from "./PostPreview"
import CommentPreview from "./CommentPreview";
import { Banner } from "./Banner";

export function Feed({hideBoardName, hideUserName, feed, handleItemVote})
{
    console.log("feed", feed);


    const renderContentPreview = (item) => 
    {
        if(!item.type || item.type == "post") //default
        {
            return (
                <PostPreview
                    key={item.id} 
                    hideBoardName={hideBoardName}
                    hideUserName={hideUserName}
                    data={item}
                    onVote={handleItemVote}
                ></PostPreview>
            )
        }
        else if(item.type == "comment")
        {
            return (
                <CommentPreview
                    key={item.id}
                    hideBoardName={hideBoardName}
                    hideUserName={hideUserName}
                    data={item}
                    onVote={handleItemVote}
                ></CommentPreview>
            )
        }
        else if (item.type == "board")
        {
            return (
                <Banner 
                    key={item.id}
                    className="mb-8" 
                    bannerTitle={item.title}
                    bannerDescription={item.description}
                    bannerLink={`/r/${item.title}`}
                    bannerPictureLink={item.boardProfilePic}
                ></Banner>
            )
        }
        else if (item.type == "profile")
        {
            return (
                <Banner 
                    key={item.id}
                    className="mb-8" 
                    bannerTitle={item.userName}
                    bannerDescription={item.description}
                    bannerLink={`/u/${item.userName}`}
                    bannerPictureLink={item.profilePic}
                ></Banner>
            )
        }
    }


    return(
        <>
            <div id="feed" className="flex flex-col">
            {
                feed.items &&
                feed.items.map((item) => renderContentPreview(item))
            }
            </div>
        </>
    )
}

export const MemoizedFeed = memo(Feed);