const { sanitizeHtml } = require(baseDir + "/src/utils/sanitize");
const { getDecodedHtmlLength } = require(baseDir + "/src/utils/misc");

const userModel = require(baseDir + "/src/Models/user-model");
const commentModel = require(baseDir + "/src/Models/comment-model");

/*
    Vote on comment.

    userId (int, required): The id of the user who is voting
    commentId (int, required): The comment being voted on
    voteDirection (int/str, required): An integer denoting the direction of the vote.
        1 = up; -1 = down; 0 = stays the same

    returns (obj):
        {
            ok (bool): false if error ocurred
            changeInVote (int): the amount a vote has changed. Used to update clientside vote data
        }
*/
const voteOnComment = async function(userId, commentId, voteDirection) {
    voteDirection = parseInt(voteDirection);
    if(voteDirection != 1 && voteDirection != -1 && voteDirection != 0)
        return {ok: false, statusCode: 400, error: "Invalid vote direction."}

    //Get current vote, if it exists
    let userVote = await commentModel.getCommentVoteDirection(userId, [commentId]);
    let changeInVote = 0;

    userVote = userVote[commentId];
    if(userVote == 0) //user hasn't voted on this comment; create new vote entry
    {
        await commentModel.insertCommentVote(userId, commentId, voteDirection);
        changeInVote = voteDirection;
    }
    else if (userVote == voteDirection) //clicking the same vote direction again after already voting will undo the vote; we delete this record to undo the vote
    {
        await commentModel.deleteCommentVote(userId, commentId);
        changeInVote = -voteDirection;
    }
    else //user wants to change their vote direction; alter existing vote record
    {
        await commentModel.updateCommentVote(userId, commentId, voteDirection);
        changeInVote = (voteDirection == -1) ? -2 : 2; 
    }

    //Need to update numVotes in comments table with the new vote
    await commentModel.updateNumCommentVotes(changeInVote, commentId);

    //The author of the comment has their score adjusted
    const authorId = await commentModel.getAuthorId(commentId);
    await userModel.addVotes(authorId, changeInVote);

    return {ok: true, changeInVote: changeInVote};
};


/*
    Returns a list of comments that belong to a given postId

    userId(int): The requesting user
    postId(int): The post which the comments belong to
    offset(int): 
    filter(str): How to filter the comments. Currently only supports "new" and "top" for comments
    post(obj): data about the post

    returns (obj):
        {
            ok (bool): false if error ocurred
            data: comment data returned from commentModel.getCommentTree
        }
*/
const getComments = async function({parentId, userId, postId, offset, filter, lastSeenComment})
{
    const commentData = await commentModel.getCommentTree({postId, offset, filter, lastSeenComment, parentId, userId})

    let data = {
        comments: commentData.commentTree,
        endOfComments: commentData.endOfComments
    };

    return {ok: true, data: data};
};


/*
    Post a new comment

    comment (str, required): Content of the new comment to post
    authorId (int, required): ID of the author of the comment
    postId (int, required): The ID of the post the new comment belongs to
    parentId (int, required): The ID of the parent comment, if it exists

    returns (obj):
        {
            ok (bool): false if error ocurred
            data: comment data returned from commentModel.getComment
        }
*/
const postComment = async function(comment, authorId, postId, parentId)
{
    comment = sanitizeHtml({content: comment})

    /*
        Comment character count should be <= CONFIG.MAX_LENGTH_COMMENT chars.
        For user friendliness and usability, html formatting tags and encoding aren't counted
        towards this limit, but we still need to enforce a HARD limit to prevent someone from
        inserting an infinitely long comment into the database consisting of just HTML tags. 
        This hard limit is arbitrarily set to CONFIG.MAX_LENGTH_COMMENT * 3.
        This IF condition checks the character count limit with and without encoding/tags
    */
    const decodedCommentLength = getDecodedHtmlLength(comment);
    if(
        decodedCommentLength > CONFIG.MAX_LENGTH_COMMENT || 
        decodedCommentLength < 1 ||
        comment.length > CONFIG.MAX_LENGTH_COMMENT * 3)
    {
        return {ok: false, statusCode: 400, error: `Comment length must be between 0 and ${CONFIG.MAX_LENGTH_COMMENT} characters.`}
    }


    if(!comment || comment == "")
    {
        return {ok: false, statusCode: 400, error: "Invalid comment"}
    }

    const insertId = await commentModel.insertComment(comment, authorId, postId, parentId);
    const insertedComment = await commentModel.getComment(insertId, authorId);
    return {ok: true, data: insertedComment};
}

/*
    Removes comments. Note "removing" a comment in this context does NOT delete
    it entirely. It marks the comment as "deleted", which will then be hidden from users.

    commentIds ([int], required): IDs of the comments to hide

    returns (obj):
    {
        ok (bool): True if comments were successfully hidden.
    }
*/
const removeComments = async function({commentIds})
{
    if(!commentIds || commentIds.length < 1)
    {
        return {ok: false, statusCode: 400, error: "Invalid comment ID(s)."}
    }

    const removeOp = await commentModel.markCommentsAsDeleted({commentIds});

    if(!removeOp)
    {
        return {ok: false, statusCode: 400, error: "Comment ID(s) not found."};
    }
    return {ok: true};
}


module.exports = {removeComments, voteOnComment, getComments, postComment };