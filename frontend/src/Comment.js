
//Components
import CreatedTimestamp from "./CreatedTimestamp"
import TipTapEditor from "./TipTapEditor";
import HTMLBearingDiv from "./HTMLBearingDiv";
import VoteController from "./VoteController";
import Button from "./Button";
import { Link } from "react-router-dom";

//Utils
import { twMerge } from "tailwind-merge";
import { concatCommentTree, applyToAllComments } from "./Post";
import { memo } from "react";

//States
import { useState } from "react";


export default function Comment({data, className, setPost, postComment, loadComments})
{
    //States
    const [replyBoxOpen, setReplyBoxOpen] = useState(false);

    /*
        Sometimes the server will send new comments that contain duplicates, or skip
        some comments. This is due to the unstable nature of filtering based off unstable
        values(numVotes). We can easily discard these comments, but it also means that
        the number of comments inside data.comments will always be less than data.comment_count.
        This causes the "show more" button to always render if we were to base it off of
        data.comment.length < data.comment_count
        So instead, we create a new variable "processedComments" that stores the amount
        of comments we processed, even if we discarded them. By doing this, we can guarantee
        that the show more button will not render when we've exhausted all comments.
        see more: https://coderwall.com/p/lkcaag/pagination-you-re-probably-doing-it-wrong
    */
    const showMoreVisible = data.processedComments < data.comment_count;


    console.log("comment render");


    return (
        <div className={twMerge("mt-4", className)}>
            <div className="flex">

                <VoteController 
                    //Updates the comment's vote data when the user submits a new vote
                    onVoteChange=
                    {
                        (newVoteData) => 
                        {
                            setPost((prev) => 
                            {
                                let newPost = structuredClone(prev);
                                let match = newPost.commentMap.get(data.id);
                                match.numVotes = newVoteData.numVotes;
                                match.voteDirection = newVoteData.voteDirection;
                                return newPost;
                            })
                        }
                    } 
                    relativeVoteRoute={`voteComment/${data.id}`}
                    className="min-w-6 max-w-6"
                    voteDirection={data.voteDirection} 
                    voteCount={data.numVotes}
                />

                {/*Contains the content of the comment*/}
                <div className="rounded-r-md px-4 py-1 bg-zinc-950 flex-1">
                    <CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation} className="text-zinc-300">by <Link to={`/u/${data.author}`} className="hover:underline">{data.author}</Link></CreatedTimestamp>
                    <HTMLBearingDiv htmlContent={data.content} className="break-all my-1"></HTMLBearingDiv>
                    <div onClick={() => setReplyBoxOpen(prev => !prev)} className="text-zinc-300 hover:underline hover:cursor-pointer w-min">reply</div>
                </div>

            </div>

            {replyBoxOpen && <TipTapEditor className="mt-4" 
                onSubmit=
                {
                    (commentBody) => 
                    {
                        postComment(    {parentId: data.id, comment: commentBody},
                                        // Callback triggered on successful comment post
                                        (results) =>
                                        {
                                            setPost(prev => {
                                                let newPost = structuredClone(prev);
                                                applyToAllComments(results, (comment) => comment.processedComments = comment.comments.length);
                                                concatCommentTree(newPost.commentMap, newPost.commentMap.get(data.id).comments, results, "unshift");
                                                newPost.commentMap.get(data.id).processedComments += 1;
                                                newPost.postHeader.numComments += 1;
                                                newPost.commentMap.get(data.id).comment_count += 1;
                                                return newPost;
                                            });
                                        }
                        );
                        setReplyBoxOpen(false);
                    }
                }
            />}

            <div className=" border-l-[1px] border-dashed border-zinc-500 pl-4">

                {/* Child comments components rendered here */}
                {data.comments && data.comments.map((comment) => <Comment data={comment} setPost={setPost} postComment={postComment} loadComments={loadComments} key={`${comment.id}`}></Comment>)}
                
                {/* Retrive next comments from backend, then concatenate them to the comment tree after processing.*/}
                {showMoreVisible && <Button handleClick=
                {() =>
                {
                    loadComments({  offset: data.comments.length,
                                    filter: "top", 
                                    lastSeen: data.comments[data.comments.length - 1].id, 
                                    parentId: data.id
                                },
                                (results) => //onSuccess callback
                                {
                                    console.log("results", results)
                                    setPost(prev => 
                                    {
                                        let newPost = structuredClone(prev);
                                        newPost.commentMap.get(data.id).processedComments += results.comments.length;
                                        applyToAllComments(results.comments, (comment) => comment.processedComments = comment.comments.length);
                                        concatCommentTree(newPost.commentMap, newPost.commentMap.get(data.id).comments, results.comments);
                                        return newPost;
                                    });
                                }
                                )
                            }
                }
                className="mt-4 h-min py-1 px-2 text-xs">SHOW MORE</Button>}
                </div>
        </div>
    )
}

export const MemoizedComment = memo(Comment);

/*
comments: [] (child comments)
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