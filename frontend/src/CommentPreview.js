import CreatedTimestamp from "./CreatedTimestamp";
import VoteController from "./VoteController"
import HTMLBearingDiv from "./HTMLBearingDiv";
import Button from "./Button";
import { useStore } from "./Store";
import { Link } from "react-router-dom";

export default function CommentPreview({data, onVote, hideBoardName, hideUserName})
{

    return (
        <div className="content-item bg-zinc-950 mb-8 min-h-24 flex flex-row pr-2 rounded-md">
            <VoteController 
                onVoteChange={(newVoteData) => {onVote(data.id, newVoteData)}} 
                voteDirection={data.voteDirection} voteCount={data.numVotes} 
                relativeVoteRoute={`voteComment/${data.id}`}>
            </VoteController>
            
            <div className="flex flex-col px-4 py-1 mr-auto w-full min-w-0">

                <div className="flex items-end">
                    {data.subredditName && !hideBoardName &&
                    <>
                        <div className='placeholder-avatar rounded-full w-5 h-5 bg-blue-500 mr-1'></div>
                        <Link to={`/r/${data.subredditName}`} className=" hover:underline text-sm align-middle text-zinc-300">{data.subredditName}</Link>
                    </>}
                    {data.subredditName && !hideBoardName && data.author && !hideUserName && <div className="mx-2 text-zinc-300">&#8226;</div>}
                    {data.author && !hideUserName &&
                    <>
                        <div className='placeholder-avatar rounded-full w-5 h-5 bg-red-500 mr-1'></div>
                        <Link to={`/u/${data.author}`} className="hover:underline text-sm align-middle text-zinc-300">{data.author}</Link>
                    </>}
                    <div className="text-sm break-words">&nbsp;{"->"}&nbsp;<a href={`/r/${data.subredditName}/post/${data.post_id}`} className="hover:underline">{data.title}</a></div>
                </div>

                <CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation} leadingText={"commented"}></CreatedTimestamp>
                {/* <a className="mt-2 text-xl hover:underline break-words" href={`/r/${data.subredditName}/post/${data.post_id}`}>{data.title}</a> */}
                <HTMLBearingDiv htmlContent={data.content} className="break-words my-1"></HTMLBearingDiv>
                <div className="flex flex-row mt-auto pt-4">
                </div>
            </div>
        </div>
    );
}

//content: "teadwadw"
// created_at: "2023-12-08T01:35:25.000Z"
// id: 80
// imgSrc: ""
// minutes_ago: 222389
// numComments: 0
// numVotes: 1
// postLink: ""
// subredditName: "testSub3"
// subreddit_id: 3
// timeSinceCreation: "5 months ago"
// title: "testing"
// userName : "FOUR"
// voteDirection : 0
//