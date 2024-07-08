import CreatedTimestamp from "./CreatedTimestamp"
import { twMerge } from "tailwind-merge";
import VoteController from "./VoteController";
import { useState } from "react";

function setComment(comments, newVoteData, id)
{
    if (comments.length < 1) return false;

    for (let i = 0; i < comments.length; ++i)
    {
        if(comments[i].id == id)
        {
            comments[i].numVotes = newVoteData.numVotes;
            comments[i].voteDirection = newVoteData.voteDirection;
            return true;
        }
        if (setComment(comments[i].children, newVoteData, id)) return true;
    }
    return false;
}


export default function Comment({data, className, setPost})
{

    return (
        <div className={twMerge("ml-4 mt-4", className)}>
            <div className="flex">
                <VoteController 
                    onVoteChange=
                    {
                        (newVoteData) => 
                        {
                            setPost((prev) => 
                            {
                                let newComments = structuredClone(prev.comments);
                                setComment(newComments, newVoteData, data.id);
                                return {...prev, comments: newComments};
                            })
                        }
                    } 
                    relativeVoteRoute={`voteComment/${data.id}`}
                    className="min-w-6 max-w-6"
                    voteDirection={data.voteDirection} 
                    voteCount={data.numVotes}
                />
                <div className="rounded-r-md p-4 bg-zinc-950 flex-1">
                    <div><CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation}>by {data.author}</CreatedTimestamp></div>
                    <div>{data.content}</div>
                </div>
            </div>
            <div className=" border-l-[1px] border-dashed border-zinc-500">
                {data.children && data.children.map((comment) => <Comment data={comment} setPost={setPost}></Comment>)}
            </div>
        </div>
    )
}

/*
children: []
content: "this is a comment..."
created_at: "2023-08-06T11:04:51.000Z"
id: 31
minutesSinceCreation: 481753
numVotes: 2
post_id: 18
userName: "FOUR"
user_id: 13
voteDirection: 0
*/