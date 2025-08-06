"use strict";
const errors = require(baseDir + "/src/utils/error");
const commentService = require(baseDir + "/src/Services/comment-service");

/*
    Handles requests for voting on a comment.

    - requires active user session

    URL param args:
        commentId (int, required): ID of the comment being voted on
    
    body args:
        direction (int, required): Direction of the vote (0, -1, 1)
*/
const handleCommentVoteRequest = async function(req, res) {
    let commentVote = await commentService.voteOnComment(req.session.userID, req.params.commentId, req.body.direction);
    if(!commentVote.ok)
    {
        res.status(commentVote.statusCode).send(commentVote.error);
        return;
    }
    res.send(`${commentVote.changeInVote}`);
};

/*
    Handles request for new comments.

    - requires active user session
    - requires board data
    - (see middlewares)

    URL param args:
        postId (int, required): ID of the post for which the new comment belongs to

    body args:
        comment (str, required): The content of the comment
        parentId (int, optional): The ID of the comment's parent comment, if it exists.
*/
const handleNewCommentRequest = async function(req, res) {
    let result = await commentService.postComment(req.body.comment, req.session.userID, req.params.postId, req.body.parentId);

    if(result.ok)
    {
        res.status(200).send(result.data);
    }
    else
    {
        res.status(result.statusCode).send({error: result.error});
    }
    return;
};

/*
    Handles requests for comment retrievals

    - requires board data

    URL param args:
        postId (int, required): ID of the post which comments are being loaded from

    queryParam args:
        offset (int, optional): Number of comments to skip 
        filter (str, optional): Filter for comments (top, new, etc.)
        lastSeenComment (int, optional): ID of the last comment seen. Any further comments 
            will be loaded after this (if filtering by new)
        parentId (int, optional): ID of the parent comment, if one exists.

*/
const handleLoadCommentsRequest = async function(req, res) {
    let commentData = await commentService.getComments({userId: req.session.userID, postId: req.params.postId, offset: req.query.offset, filter: req.query.filter, lastSeenComment: req.query.lastSeen, parentId: req.query.parentId});
    if(!commentData.ok)
    {
        res.status(commentData.statusCode).send(commentData.error);
        return;
    }
    res.status(200).send(commentData.data);
}

/*
    Deletes a specific comment.
    - requires active user session
    - requires "CONTENT_MODERATION" permissions for specified board

    body args: 
    {
        commentId (int, required): ID of the comment to delete
    }
*/
const handleDeleteCommentRequest = async function(req, res)
{
    const deleteRequest = await commentService.removeComments({commentIds: [req.body.commentId]});
    if(!deleteRequest.ok)
    {
        res.status(deleteRequest.statusCode).send(deleteRequest.error);
        return;
    }
    res.status(200).send({status: "SUCCESS"});
}


module.exports = { 
    handleDeleteCommentRequest, 
    handleCommentVoteRequest, 
    handleNewCommentRequest, 
    handleLoadCommentsRequest 
};