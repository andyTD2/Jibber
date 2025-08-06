import CreatedTimestamp from "./CreatedTimestamp";
import HTMLBearingDiv from "./HTMLBearingDiv";
import VoteController from "./VoteController"
import Button from "./Button";
import { Link } from "react-router-dom";
import { useStore } from "./Store";
import ModerationControls from "./ModerationControls";
import ModerationMenuElement from "./ModerationMenuElement";
import { banUser, banUserSitewide, deleteComment, deletePost } from "./utils/moderationActions";
import { twMerge } from "tailwind-merge";

/*
    This component renders a preview of a post. It's used in feeds to provide a more
    compact view of a post.

    onVote (func, required): A callback that triggers when the user votes on post.
        This is generally used by the parent component to update the state of PostPreview
        with the new vote.

    hideBoardName (bool, optional): Set to true if you want the board name to be hidden

    hideUserName (bool, optional): Set to true if you want the username to be hidden

    hideContent (bool, optional): Set to true if you want to hide the text content

    hideNumComments (bool, optional): Set to true if you want to hide the button that displays num comments

    moderator (bool, optional): Set to true to enable moderator actions

    data (obj, required): Data related to the post (title, author, etc), that is required
    to render the preview. The format is as follows:

        {
            content: "example content"
            createdAt: "2023-12-08T01:35:25.000Z"
            id: 80
            imgSrc: ""
            minutes_ago: 222389
            commentCount: 0
            numVotes: 1
            postLink: ""
            boardName: "testBoard3"
            boardId: 3
            title: "testing"
            username : "FOUR"
            voteDirection : 0
        }
*/
export default function PostHeader({data, onVote, hideBoardName, hideUserName, hideContent, hideNumComments, className, moderator})
{
    if(data.deleted)
    {
        return (
            <div className="rounded-md dark:bg-dark1 bg-light1 w-full text-red-600 text-center text-2xl p-2">This post has been deleted.</div>
        )
    }

    const modActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banUser(data.authorId, data.boardId, onSuccess)}>Ban Author</ModerationMenuElement>,
        <ModerationMenuElement handleClick={(onSuccess) => deletePost(data.id, data.boardId, onSuccess)}>Delete Post</ModerationMenuElement>
    ]

    const adminActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banUserSitewide(data.authorId, onSuccess)}>Ban Author (Sitewide)</ModerationMenuElement>
    ]


    return (
        <div className={twMerge("shadow-lg content-item color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 mb-8 min-h-32 flex flex-row pr-2 rounded-md md:rounded-none", className)}>

            {/* Left */}
            <VoteController 
                onVoteChange={(newVoteData) => {onVote(data.id, newVoteData)}} 
                voteDirection={data.voteDirection} voteCount={data.numVotes} 
                relativeVoteRoute={`vote/${data.id}`}>
            </VoteController>
            
            {/* Center */}
            <div className="flex flex-col px-4 md:pl-2 md:pr-0 py-1 mr-auto w-0 flex-1 overflow-y-visible overflow-x-clip">
                <div className="flex items-center w-full flex-wrap">

                    {data.boardName && !hideBoardName &&
                        <div className="flex">
                            <img className='placeholder-avatar rounded-full w-5 h-5 mr-1 object-cover shadow-light dark:shadow-lightShadow-light' src={data.boardPicture}></img>
                            <Link to={`/b/${data.boardName}`} className=" hover:underline text-xs align-middle dark:text-darkText2 text-lightText2">{data.boardName}</Link>
                        </div>
                    }

                    {data.boardName && !hideBoardName && data.author && !hideUserName && 
                        <div className="mx-2 dark:text-darkText2 text-lightText2">&#8226;</div>
                    }

                    {data.author && !hideUserName &&
                        <div className="flex">
                            <img className='placeholder-avatar rounded-full w-5 h-5 mr-1 object-cover shadow-light dark:shadow-lightShadow-light' src={data.authorProfilePic}></img>
                            <Link to={`/u/${data.author}`} className="hover:underline text-xs align-middle dark:text-darkText2 text-lightText2">{data.author}</Link>
                        </div>
                    }
                </div>

                <CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation} className="dark:text-darkText2 text-lightText2"></CreatedTimestamp>
                <a className="mt-2 text-xl xs:text-base xxs:text-sm hover:underline break-words" href={data.postLink ? data.postLink : `/b/${data.boardName}/post/${data.id}`}>{data.title}</a>
                {!hideContent && data.content && <HTMLBearingDiv className="p-spacing [overflow-wrap:anywhere] mt-2 [&_a:visited]:text-purple-600 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:cursor-pointer" htmlContent={data.content}></HTMLBearingDiv>}

                <div className="flex flex-row mt-auto pt-4 relative">
                    {!hideNumComments && data.commentCount != undefined && <Link to={`/b/${data.boardName}/post/${data.id}`}><Button theme="primary" className="mr-4 h-6 px-2 text-xs py-0"><img className="size-4 mr-1" src="/comments-light.png"></img>{data.commentCount}</Button></Link>}
                    <ModerationControls 
                        isModerator={moderator}
                        modActions={modActions}
                        adminActions={adminActions}
                    >        
                    </ModerationControls>
                </div>
            </div>

            {/* Right */}
            {<img src={data.imgSrc ? data.imgSrc : "/text-icon.png"} onError={(e) => {e.target.onerror = null; e.target.src = "/text-icon.png"}} className="shrink-0 size-28 md:size-14 object-cover my-2 ml-2"></img>}

        </div>
    );
}
