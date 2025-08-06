"use strict";

const { parse } = require("ipaddr.js");

const errors = require(baseDir + "/src/utils/error");

const db = require(baseDir + "/src/utils/db");
const queryDb = db.queryDb;
const {parseOffset, getFilterQuery} = require(baseDir + "/src/utils/misc");
const {updatePostCommentCount} = require(baseDir + "/src/Models/post-model");


/*
    A comment record/item has the following format:
    {
        id (int): ID of the comment
        numVotes (int): The number of votes the comment has
        content (str): The content of the comment
        createdAt (date): Creation date of the comment
        userId (int): ID of the author
        postId (int): ID of the post the comment belongs to
        parentId (int): ID of the parent comment
    }

    A commentVote record has the following format:
    {
        commentId (int): ID of the comment that was voted on.
        userId (int): ID of the voter
        direction (int): The direction of the vote, as an int. 1 = up; -1 = down
    }
*/



/*
    Provided with a comment ID, this function retrieves the corresponding author ID.

    commentId (int, required): ID of the comment

    return (int/undefined): Returns the ID of the author if it exists, else undefined
*/
const getAuthorId = async function(commentId)
{
    const result = await queryDb("SELECT userId AS authorId FROM comments WHERE id = ?", [commentId]);

    if(result.length > 0)
        return result[0].authorId;

    return undefined;
}

/*
    Insert a new record indicating a user has voted on a comment.

    voterId (int, required): ID of the person voting
    commentId (int, required): ID of the comment being voted on
    voteDirection (int, rquired): The direction of the vote, represented by an int (1 = up; -1 = down)
*/
const insertCommentVote = async function(voterId, commentId, voteDirection)
{
    await queryDb("INSERT INTO commentVotes (userId, commentId, direction) VALUES (?, ?, ?)", [voterId, commentId, voteDirection]);
};

/*
    Delete a vote record

    voterId (int, required): ID of the voter
    commentId (int, required): ID of the comment that was voted on
*/
const deleteCommentVote = async function(voterId, commentId)
{
    await queryDb("DELETE FROM commentVotes WHERE userId = ? AND commentId = ?", [voterId, commentId]);
};

/*
    Updates a vote record with new voteDirection

    voteId (int, required): ID of the voter
    commentId (int, required): ID of the comment that is being voted on
    voteDirection (int, required): New direction of the vote, represented as an int
*/
const updateCommentVote = async function(voterId, commentId, voteDirection)
{
    await queryDb("UPDATE commentVotes SET direction = ? WHERE userId = ? AND commentId = ?", [voteDirection, voterId, commentId]);
};

/*
    Updates the numVotes value of a comment, which allows for easy retrieval of vote data

    changeInVote (int, required): The amount of votes being added to numVotes
    commentId (int, required): ID of the comment that is being adjusted
*/
const updateNumCommentVotes = async function(changeInVote, commentId)
{
    await queryDb("UPDATE comments SET numVotes = numVotes + ? WHERE id = ?", [changeInVote, commentId]);
};

/*
    Gets the current vote directions of a user for a number of comments

    userId (int, optional): ID of the user to get vote data for. Omitting this parameter returns 0 for all comments
    commentIds ([int], required): An array of comment IDs to check vote direction for

    return (map): A map where the key is the ID of a comment, and the value is the vote direction
*/
const getCommentVoteDirection = async function(userId, commentIds)
{
    let voteMap = {}
    if(commentIds.length < 1) return voteMap;

    if(!userId)
    {
        for(let id of commentIds)
        {
            voteMap[id] = 0;
        }
        return voteMap;
    }

    let result = await queryDb("SELECT * FROM commentVotes WHERE userId = ? AND commentId IN (?)", [userId, commentIds]);
    
    //Convert results from array to map
    for(let voteRecord of result)
    {
        voteMap[voteRecord.commentId] = voteRecord.direction;
    }

    //If vote record is not in commentVotes, it means the user did not vote on it, so we set the value to 0
    for(let id of commentIds)
    {
        if(!(id in voteMap))
        {
            voteMap[id] = 0;
        }
    }
    return voteMap;
};

/*
    Inserts a new comment into the DB.

    comment (str, required): Content of the comment to insert.
    userId (int, required): ID of the comment author.
    postId (int, required): ID of the post being commented on.
    parentId (int, optional): ID of the parent comment (if this is a reply), if it exists

    return (int): The ID of the newly inserted comment
*/
const insertComment = async function(comment, userId, postId, parentId) {
    let contentResult = await queryDb("INSERT INTO CONTENT (type) VALUES ('comment')");

    let queryValues = [contentResult.insertId, comment, userId, postId, (parentId || null)];
    let query = "INSERT INTO comments (id, content, userId, postId, parentId) VALUES (?, ?, ?, ?, ?)";
    
    let result = await queryDb(query, queryValues);
    if(!result.error)
    {
        await updatePostCommentCount(postId, 1, parentId == undefined);
        
        return contentResult.insertId;
    }
};


const commentFilters = {
    new: `createdAt`,
    top: `numVotes`
};

/*
    Retrieves entire comment tree for a post.

    postId (int, required): ID of the post for which comments are being retrieved
    filter (str, optional, default: "top"): Filter for which to sort the comments by
    lastSeenComment (int, optional): If sorting by new, this value dictates where to start loading comments from
    parentId (int, optional): If present, retrieves the comment tree for this comment's children
    userId (int, optional): ID of the current user. Used to get vote data.
    offset (int, optional): Offset denotes the number of comments to skip before loading.

    return (obj):
        {
            endOfComments (bool): True if all comments have been retrieved, false if more can be loaded
            commentTree ([obj]): Array of comment items. See top of file for format
        }
*/
const getCommentTree = async function({postId, filter = "top", lastSeenComment, parentId, userId, offset})
{
    //Validate the filter and offset
    let orderBy = getFilterQuery(filter, "top", commentFilters);
    let newOffset = parseOffset(offset)

    //The amount of comments being loaded differs depending on they are being loaded
    //as root comments, or child comments.
    let limit = parentId ? CONFIG.CHILDREN_PER_COMMENT : CONFIG.COMMENTS_PER_PAGE;

    // Retrieve comments
    const params = [postId]
    let queryStr = `    SELECT 
                            COMMENTS.id,
                            comments.numVotes, 
                            content, 
                            comments.createdAt, 
                            userId, 
                            postId, 
                            parentId, 
                            username AS author, 
                            profilePicture AS authorProfilePic,
                            TIMESTAMPDIFF(MINUTE, comments.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation,
                            COMMENTS.deleted
                        FROM 
                            COMMENTS 
                        LEFT JOIN 
                            users ON comments.userId = users.id
                        LEFT JOIN
                            profiles ON comments.userId = profiles.id
                        WHERE 
                            postId = ?`;

    if(parentId)
    {
        queryStr += " AND parentId = ?"
        params.push(parentId)
    }
    else
    {
        queryStr += " AND parentId IS NULL"
    }
    
    //Filtering by date created means we're only interested in comments after the one we last saw
    if(lastSeenComment && orderBy == "createdAt")
    {
        queryStr += " AND COMMENTS.id < ?"
        params.push(lastSeenComment)
    }

    //Filter by new, top, etc.
    queryStr += ` ORDER BY ${orderBy}
                DESC LIMIT ?`

    //We retrieve an additional comment but do not return it to the user. This tells us
    //whether there are additional comments remaining to be loaded, or if we have reached the end
    //ie., we retrieve 21 comments and get 20, that means there are none left. if we retrieve 21 and 
    //get 21, we return 20, and there is at least 1 left
    params.push(limit + 1)

    //Use offset for pagination, but only if sorting by number of votes
    if(orderBy == "numVotes" || !lastSeenComment)
    {
        queryStr += " OFFSET ?"
        params.push(newOffset);
    }

    let commentTree = await queryDb(queryStr, params);
    let endOfComments = true;
    if(commentTree.length > limit)
    {
        endOfComments = false;
        commentTree.pop();
    }

    //Get vote direction for all our retrieved comments
    const voteMap = await getCommentVoteDirection(userId, commentTree.map(comment => comment.id))
    for(let comment of commentTree)
    {
        // Hide contents if comment was deleted
        if(comment.deleted)
        {
            comment.content = undefined;
            comment.author = undefined;
            comment.authorProfilePic = undefined;
        }

        comment.voteDirection = voteMap[comment.id];
        //Recursively call the function on each of our comments in order to get child comments.
        let childCommentData = await getCommentTree({postId, userId, parentId: comment.id, filter: "top"});
        comment.comments = childCommentData.commentTree;
        comment.endOfComments = childCommentData.endOfComments;
    }

    return {
        endOfComments,
        commentTree
    };
};

/*
    Retrieves a singular comment. Does not retrieve its children.

    commentId (int, required): ID of the comment to retrieve.
    userId (int, required): ID of the current user.

    return (obj): The comment. See top of file for format
*/
const getComment = async function(commentId, userId)
{
    let query = `SELECT 
                    COMMENTS.id, 
                    comments.numVotes, 
                    content, 
                    comments.createdAt, 
                    userId, 
                    postId, 
                    username as author, 
                    profilePicture AS authorProfilePic,
                    TIMESTAMPDIFF(MINUTE, comments.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation 
                FROM 
                    COMMENTS 
                LEFT JOIN 
                    users ON comments.userId = users.id 
                LEFT JOIN 
                    profiles ON comments.userId = profiles.id
                WHERE 
                    COMMENTS.id = ?`;
    let result = (await queryDb(query, [commentId]));
    
    result[0].endOfComments = true;
    result[0].comments = [];
    result[0].voteDirection = (await getCommentVoteDirection(userId, [commentId]))[commentId];
    return result;
}

/*
    Mark comments as being deleted.

    commentIds ([int], required): Array of IDs of the comments to mark as being deleted

    returns (bool): Number of comments marked as deleted.
*/
const markCommentsAsDeleted = async ({commentIds}) => 
{
    const deleteOp = await queryDb("UPDATE comments SET deleted = TRUE WHERE id IN (?)", [commentIds], true);
    return deleteOp.affectedRows;
}

/*
    Mark all comments from a specific user as being deleted.

    userId (int, required): ID of the user that will have their comments deleted

    returns (int): Amount of comments deleted.
*/
const markUserCommentsAsDeleted = async (userId) => 
{
    const deleteOp = await queryDb("UPDATE comments SET deleted = TRUE WHERE userId = ?", [userId]);
    return deleteOp.affectedRows;
}

/*
    Mark all comments from a specific board as being deleted.

    boardId (int, required): ID of the board that will have its comments deleted

    returns (int): Amount of comments deleted.
*/

const markBoardCommentsAsDeleted = async (boardIds) => 
{
    const deleteOp = await queryDb(`
        UPDATE comments
        JOIN posts ON postId = posts.id
        SET comments.deleted = true
        WHERE boardId IN (?);
        `, [boardIds]);

    return deleteOp.affectedRows;
}

module.exports = {
    markBoardCommentsAsDeleted,
    markUserCommentsAsDeleted,
    markCommentsAsDeleted,
    getAuthorId, 
    insertCommentVote, 
    deleteCommentVote, 
    updateCommentVote, 
    updateNumCommentVotes, 
    getCommentVoteDirection, 
    insertComment, 
    getCommentTree, 
    getComment 
};