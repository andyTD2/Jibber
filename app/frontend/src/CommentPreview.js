import CreatedTimestamp from "./CreatedTimestamp";
import VoteController from "./VoteController"
import HTMLBearingDiv from "./HTMLBearingDiv";

import { Link } from "react-router-dom";

import { twMerge } from "tailwind-merge";

/*
    This component provides a preview of a comment. Typically used in the context of viewing
    a user's comment history. Unlike a typical comment component, it doesn't show any child comments,
    not does it give the ability to reply. Users can still vote on the comment using the provided interface

    data (obj, required): data that contains the necessary comment content (see below for example)
    onVote (func, required): callback that is triggered when the vote is changed
    hideBoardName (bool, optional): set to true if the board name should be hidden
    hideUserName (bool, optional): set to true if the username should be hidden

    example of the required data inside data prop:

    {
        content: "content for a comment..."
        createdAt: "2023-12-08T01:35:25.000Z"
        id: 80
        minutesSinceCreation: 222389
        numVotes: 1
        boardName: "testBoard3"
        title: "testing"
        voteDirection : 0
    }
*/
export default function CommentPreview({data, onVote, hideBoardName, hideUsername, className})
{
    return (
        <div className={twMerge("content-item color-transition dark:bg-dark1 bg-light1 mb-8 min-h-24 flex flex-row pr-2 rounded-md shadow-md", className)}>
            <VoteController 
                onVoteChange={(newVoteData) => {onVote(data.id, newVoteData)}} 
                voteDirection={data.voteDirection} voteCount={data.numVotes} 
                relativeVoteRoute={`voteComment/${data.id}`}>
            </VoteController>
            
            <div className="flex flex-col px-4 py-1 mr-auto w-full min-w-0 text-lightText1 dark:text-darkText1">

                <div className="flex items-end">
                    {data.boardName && !hideBoardName &&
                    <>
                        <img className='placeholder-avatar rounded-full w-5 h-5 mr-1' src={data.boardPicture}></img>
                        <Link to={`/b/${data.boardName}`} className=" hover:underline text-sm align-middle dark:text-darkText2 text-lightText2">{data.boardName}</Link>
                    </>}
                    {data.boardName && !hideBoardName && data.author && !hideUsername && <div className="mx-2 dark:text-darkText2 text-lightText2">&#8226;</div>}
                    {data.author && !hideUsername &&
                    <>
                        <div className='placeholder-avatar rounded-full w-5 h-5 mr-1'></div>
                        <Link to={`/u/${data.author}`} className="hover:underline text-sm align-middle dark:text-darkText2 text-lightText2">{data.author}</Link>
                    </>}
                    <div className="text-sm break-words">&nbsp;&rarr;&nbsp;<Link to={`/b/${data.boardName}/post/${data.postId}`} className="hover:underline">{data.title}</Link></div>
                </div>

                <CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation} leadingText={"commented"}></CreatedTimestamp>
                <HTMLBearingDiv htmlContent={data.content} className="p-spacing break-words my-1"></HTMLBearingDiv>
                <div className="flex flex-row mt-auto pt-4">
                </div>
            </div>
        </div>
    );
}
