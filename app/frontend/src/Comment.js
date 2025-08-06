import CreatedTimestamp from "./CreatedTimestamp"
import ReplyBox from "./ReplyBox";
import HTMLBearingDiv from "./HTMLBearingDiv";
import VoteController from "./VoteController";
import Button from "./Button";
import ModerationControls from "./ModerationControls";

import { twMerge } from "tailwind-merge";
import { concatCommentTree } from "./Post";
import { memo } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ModerationMenuElement from "./ModerationMenuElement";
import { banUser, banUserSitewide, deleteComment } from "./utils/moderationActions";

import CONFIG from "./config"

/*
    Component that renders the comment and any associated data, including child comments.
    Provides an interface for users to vote on comments or reply to other comments. This component
    is used recursively to render child comments.

    data (obj, required): Comment data to display (see below)
    className (str, optional): Optional styling to be applied to comment
    setPost (func, required): post state setter. Required to update post with any new comments
    postComment (func, required): Function that is called to post a new comment to backend
    loadComments (func, required): Function that is called to load in new comments (pagination)

    example of what data obj should look like:
    {
        comments: [] (child comments)
        content: "this is a comment..."
        createdAt: "2023-08-06T11:04:51.000Z"
        id: 31
        minutesSinceCreation: 481753
        numVotes: 2
        postId: 18
        author: "myusername"
        userId: 13
        voteDirection: 0
    }
*/
export default function Comment({moderator, boardId, data, className, setPost, postComment, loadComments})
{
    const modActions = [
        <ModerationMenuElement handleClick={(onSuccess) => deleteComment(data.id, onSuccess)}>Delete Comment</ModerationMenuElement>,
        <ModerationMenuElement handleClick={(onSuccess) => banUser(data.author, boardId, onSuccess)}>Ban User</ModerationMenuElement>
    ]

    const adminActions = [
        <ModerationMenuElement handleClick={(onSuccess) => banUserSitewide(data.author, onSuccess)}>Ban User (Sitewide)</ModerationMenuElement>
    ]

    const [replyBoxOpen, setReplyBoxOpen] = useState(false);

    return (
        <div className={twMerge("mt-4", className)}>
            <div className="flex shadow-md">

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
                <div className="rounded-r-md px-4 py-1 dark:bg-dark1 bg-light1 flex-1 color-transition overflow-x-hidden">
                    <CreatedTimestamp minutesSinceCreation={data.minutesSinceCreation} className="dark:text-darkText2 text-lightText2">by&nbsp;
                        {!data.deleted && <Link to={`/u/${data.author}`} className="hover:underline"><img className='inline placeholder-avatar rounded-full w-3 h-3 mr-1' src={data.authorProfilePic}></img>{data.author}</Link>}
                        {data.deleted == true && "[deleted]"}
                    </CreatedTimestamp>
                    {!data.deleted && <HTMLBearingDiv htmlContent={data.content} className="p-spacing [overflow-wrap:anywhere] my-1 dark:text-darkText1 text-lightText1 [&_a:visited]:text-purple-600 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:hover]:cursor-pointer"></HTMLBearingDiv>}
                    {data.deleted == true && <div className="my-1 text-red-800">This comment has been deleted.</div>}
                    <div className="flex flex-row w-full">
                        <div 
                            onClick={() => setReplyBoxOpen(prev => !prev)} 
                            className="dark:text-primaryp text-primaryText3 hover:underline hover:cursor-pointer w-min">
                            reply
                        </div>
                        <ModerationControls 
                            className="ml-auto -mr-2" 
                            isModerator={moderator} 
                            modActions={modActions} 
                            adminActions={adminActions}
                            buttonDisplayAdmin={<img src="/exclamation-light.png" className="w-4 h-4"></img>}
                            buttonDisplayModerator="..."
                            btnClassName={"p-0 h-5 w-5"}
                        >
                        </ModerationControls>
                    </div>
                </div>

            </div>

            {replyBoxOpen && <ReplyBox className="mt-4" charLimit={CONFIG.MAX_LENGTH_COMMENT}
                onSubmit=
                {
                    (commentBody, onSuccess, onFailure) => 
                    {
                        postComment(    {parentId: data.id, comment: commentBody},
                                        // Callback triggered on successful comment post
                                        // When a new comment is successfully submitted, append it to the comment tree
                                        (results) =>
                                        {
                                            setPost(prev => {
                                                let newPost = structuredClone(prev);
                                                concatCommentTree(newPost.commentMap, newPost.commentMap.get(data.id).comments, results, "unshift");
                                                newPost.postHeader.commentCount += 1;
                                                return newPost;
                                            });
                                            setReplyBoxOpen(false);
                                            if(onSuccess)
                                                onSuccess();
                                        },
                                        (results) =>
                                        {
                                            if(onFailure)
                                                onFailure(results);
                                        }
                        );
                    }
                }
            />}

            <div className=" border-l-[1px] border-dashed border-zinc-500 pl-4">

                {/* Child comments components rendered here */}
                {data.comments && data.comments.map((comment) => <Comment data={comment} setPost={setPost} postComment={postComment} loadComments={loadComments} key={`${comment.id}`}></Comment>)}
                
                {/* Retrive next comments from backend, then concatenate them to the comment tree after processing.*/}
                {!data.endOfComments && <Button handleClick=
                {() =>
                {
                    loadComments({  offset: data.comments.length,
                                    filter: "top", 
                                    lastSeen: data.comments[data.comments.length - 1].id, 
                                    parentId: data.id
                                },
                                (results) => //onSuccess callback
                                {
                                    setPost(prev => 
                                    {
                                        let newPost = structuredClone(prev);
                                        let parentComment = newPost.commentMap.get(data.id);
                                        parentComment.endOfComments = results.endOfComments;
                                        concatCommentTree(newPost.commentMap, parentComment.comments, results.comments);
                                        return newPost;
                                    });
                                }
                                )
                            }
                }
                className="mt-4 h-min py-1 px-2 text-xs bg-light1 hover:bg-light2 active:bg-light4">SHOW MORE</Button>}
                </div>
        </div>
    )
}

export const MemoizedComment = memo(Comment);