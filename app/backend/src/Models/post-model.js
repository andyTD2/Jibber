"use strict";
const errors = require(baseDir + "/src/utils/error");

const db = require(baseDir + "/src/utils/db");
const dbCon = db.pool;
const mysql = db.mysql;
const queryDb = db.queryDb;

const {calculateRank} = require(baseDir + "/src/utils/updateRanking");
const {parseOffset, getFilterQuery} = require(baseDir + "/src/utils/misc")

/*
    Post record/item consists of the following fields:
    {
        id (int): id of the post
        title (str): title of the post
        numVotes (int): Number of votes for the post
        content (str): Text content of the post
        createdAt (date): Creation date of the post
        boardId (int): ID of the board that the post belongs to
        userId (int): ID of the author of the post
        score (float): Ranking score of the post. Used when sorting by "hot"
        link (str): External link to 3rd party website, if it exists.
        imgSrc (str): Link to a preview image, if provided
        commentCount (int): Total number of comments, including replies
        rootCommentCount (int): Totle number of comments, excluding replies
    }
*/





/*
    Gets the current vote directions of a user for a number of posts

    userId (int, optional): ID of the user to get vote data for. Omitting this parameter returns 0 for all posts
    postIds ([int], required): An array of post IDs to check vote direction for

    return (map): A map where the key is the ID of a post, and the value is the vote direction
*/
const getPostVoteDirection = async function(userId, postIds)
{
    let voteMap = {}
    if(postIds.length < 1) 
    {
        return voteMap;
    }

    if(!userId)
    {
        for(let id of postIds)
        {
            voteMap[id] = 0;
        }
        return voteMap;
    }

    let result = await queryDb("SELECT * FROM postVotes WHERE userId = ? AND postId IN (?)", [userId, postIds]);
    
    for(let voteRecord of result)
    {
        voteMap[voteRecord.postId] = voteRecord.direction
    }

    //Not all postIds will have a user vote history, so we set it to default = 0
    for(let id of postIds)
    {
        if(!(id in voteMap))
        {
            voteMap[id] = 0;
        }
    }
    return voteMap;
};

/*
    Loads post data, which includes everything about a post except the comments.

    userId (int, optional): ID of the current user, which will be used to retrieve vote direction.
    postId (int, required): ID of the post to load

    return (obj): The post record. See top of file for format.
*/
const loadPostData = async function(userId, postId)
{
    let query = `SELECT 
        POSTS.id, 
        title, 
        commentCount, 
        rootCommentCount, 
        posts.numVotes, 
        content, 
        imgSrc, 
        link as postLink, 
        boardId, 
        userId, 
        username AS author, 
        profilePicture AS authorProfilePic, 
        TIMESTAMPDIFF(MINUTE, posts.createdAt, CURRENT_TIMESTAMP()) as minutesSinceCreation ,
        deleted
    FROM posts 
    LEFT JOIN users ON posts.userId = users.id
    LEFT JOIN profiles ON posts.userId = profiles.id
    WHERE posts.id = ?;`;

    let result = await queryDb(query, [postId]);
    if(result.length == 0) return undefined;

    result[0].voteDirection = (await getPostVoteDirection(userId, [postId]))[result[0].id];

    return result[0];
};

/*
    Get the ID of an author of a post.

    postId (int, required): ID of the post to retrieve

    returns (int): ID of the author
*/
const getAuthorId = async function(postId)
{
    let result = await queryDb("SELECT userId AS authorId FROM posts WHERE id = ?", [postId]);

    if(result.length > 0)
        return result[0].authorId;

    return undefined;
}

/*
    Insert a new post record into the DB.

    postTitle (str, required): Title of the post
    postContent (str, optional): Text content of the post
    postLink (str, optional): Link to external website
    boardId (int, required): ID of the board the post is being added to
    userId (int, required): ID of the author
    thumbnailImgSrc (str, optional): Preview image url of the post

    returns (int): The id of the inserted post
*/
const insertNewPost = async function(postTitle, postContent, postLink, boardId, userId, thumbnailImgSrc)
{
    let contentResult = await queryDb("INSERT INTO CONTENT (type) VALUES ('post')");

    let result = await queryDb("INSERT INTO posts (id, title, content, link, boardId, userId, imgSrc, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                [contentResult.insertId, postTitle, postContent, postLink, boardId, userId, thumbnailImgSrc, calculateRank(1, new Date())]);
    
    if(result.error) return result;

    return contentResult.insertId;
};

/*
    Update the comment count of a post.

    postId (int, required): The ID of the post to update
    count (int, required): The amount that will be added to the current count
    rootComment (bool, optional): True to also update root comment count
*/
const updatePostCommentCount = async function(postId, count, rootComment)
{
    let params = [count];
    let query = `UPDATE posts
                SET commentCount = commentCount + ?`;
    
    if(rootComment)
    {
        query += `, rootCommentCount = rootCommentCount + ?`;
        params.push(count);
    }
    query += " WHERE id = ?"
    params.push(postId);

    await queryDb(query, params);
}

/*
    Insert a new vote record for a post

    userId (int, required): ID of the coter
    postId (int, required): ID of the post being voted on
    voteDirection (int, required): Direction of the vote, represented by an int (1 = up; -1 = down)
*/
const insertPostVote = async function(userId, postId, voteDirection)
{
    await queryDb("INSERT INTO postVotes (userId, postId, direction) VALUES (?, ?, ?)", [userId, postId, voteDirection]);
};

/*
    Delete a vote record for a post

    userId (int, required): The ID of the original voter
    postId (int, required): The ID of the post that was voted on
*/
const deletePostVote = async function(userId, postId)
{
    await queryDb("DELETE FROM postVotes WHERE userId = ? AND postId = ?", [userId, postId]);
};

/*
    Change the direction of a user's post vote.

    userId (int, required): The ID of the voter
    postId (int, required): The ID of the post that needs to be modified
    voteDirection (int, required): The new vote direction, represented by a number (1 = up; -1 = down)
*/
const updatePostVote = async function(userId, postId, voteDirection)
{
    await queryDb("UPDATE postVotes SET direction = ? WHERE userId = ? AND postId = ?", [voteDirection, userId, postId]);
};

/*
    Update the number of votes for a post.

    postId (int, required): ID of the post being updated
    changeInVote (int, required): The amount of votes which will be added to the current count
*/
const addPostVotes = async function(postId, changeInVote)
{
    await queryDb("UPDATE posts SET numVotes = numVotes + ? WHERE id = ?", [changeInVote, postId]);
};

/*
    Update the ranking of a post.

    postId (int, required): ID of the post who's ranking will be updated
*/
const updatePostRank = async function(postId)
{
    let post = await queryDb("SELECT UNIX_TIMESTAMP(createdAt) as createdAt, numVotes FROM posts WHERE id = ?", [postId]);

    let newRank = calculateRank(post[0].numVotes, new Date(post[0].createdAt * 1000));
    await queryDb("UPDATE posts SET score = ? WHERE id = ?", [newRank, postId]);
}

/*
    Perform a search query to retrieve a list of matching posts.

    filterByCategory (str, optional): Filters posts by specified board
    filterByAuthor (str, optional): Filters posts by author
    lastSeen (int, optional): ID of the last seen post. Used to determine where to continue searching posts from
    searchQuery (str, required): Search query to match results against
    offset (int, optional): Number of posts to skip
    filter (str, optional): Filter method to sort posts by
    timeFilter (str, optional): Filter date to sort posts by
    userId (int, optional): ID of the current user. 

    returns (obj): 
    {
        endOfItems (bool): True if there are no more post results to load
        items ([obj]): An array of posts. See top of file for format of a post
    }
*/
const queryPosts = async function({filterByCategory, filterByAuthor, lastSeen, offset, filter, timeFilter, userId, searchQuery})
{
    const newOffset = parseOffset(offset)
    const orderBy = getFilterQuery(filter, "hot", {
                                                    hot: "score",
                                                    new: "createdAt",
                                                    top: "numVotes"
                                                });
    const orderByTime = getFilterQuery(timeFilter, "All Time", {
                                                    day: "1 DAY",
                                                    week: "1 WEEK",
                                                    month: "1 MONTH",
                                                    year: "1 YEAR"
                                                });

    let query = `SELECT 
        POSTS.id, 
        posts.numVotes, 
        commentCount, 
        posts.title AS title, 
        content, 
        imgSrc, 
        link as postLink, 
        posts.createdAt, 
        boardId, 
        boards.title AS boardName,
        boardPicture, 
        profilePicture AS authorProfilePic, 
        username as author, 
        TIMESTAMPDIFF(MINUTE, posts.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation
    FROM POSTS 
    LEFT JOIN users ON posts.userId = users.id
    LEFT JOIN boards on posts.boardId = boards.id
    LEFT JOIN profiles ON posts.userId = profiles.id
    WHERE posts.deleted = FALSE AND 
    posts.title LIKE ?`
    let params = [`%${searchQuery}%`]


    if(filterByCategory)
    {
        query += " AND boards.title IN (?)";
        params.push(filterByCategory);
    }
    if(filterByAuthor)
    {
        query += " AND username IN (?)";
        params.push(filterByAuthor);
    }
    if(orderBy == "createdAt" && lastSeen)
    {
        query += " AND POSTS.id < ?";
        params.push(lastSeen)
    }
    if(orderBy == "numVotes" && orderByTime)
    {
        query += `AND POSTS.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${orderByTime})`
    }

    query += ` ORDER BY ${orderBy} DESC LIMIT ?`;
    params.push(CONFIG.ITEMS_PER_PAGE + 1);

    if(orderBy != "createdAt" || !lastSeen)
    {
        query += " OFFSET ?";
        params.push(newOffset);
    }
    let posts = (await dbCon.query(query, params))[0];

    let endOfItems = true;
    if(posts.length > CONFIG.ITEMS_PER_PAGE)
    {
        endOfItems = false;
        posts.pop();
    }

    const voteMap = await getPostVoteDirection(userId, posts.map(post => post.id));

    for (let post of posts)
    {
        post.voteDirection = voteMap[post.id];
    }

    return {endOfItems, items: posts};
}

/*
    Retrieve a feed of posts from a specified board

    boardId (int, required): ID of the board that the posts belong to
    lastSeen (int, optional): ID of the last seen post. Used to determine where to continue searching posts from
    offset (int, optional): Number of posts to skip
    filter (str, optional): Filter method to sort posts by
    timeFilter (str, optional): Filter date to sort posts by
    userId (int, optional): ID of the current user. 
    defaultFilters (obj): object consisting of valid filters. The key is the display name of the filter, and 
        the value is the sql filter keyword that we use to sort\
    defaultTimeFilters (obj): object consisting of valid filters (by date). The key is the display name of the filter, and 
        the value is the sql filter keyword that we use to sort

    returns (obj): 
    {
        endOfItems (bool): True if there are no more post results to load
        items ([obj]): An array of posts. See top of file for format of a post
    }
*/
const getPostsByBoard = async function({boardId, lastSeen, offset, filter, timeFilter, userId, defaultFilters, defaultTimeFilters})
{
    const newOffset = parseOffset(offset)
    const orderBy = getFilterQuery(filter, "hot", defaultFilters);
    const orderByTime = getFilterQuery(timeFilter, "All Time", defaultTimeFilters);

    let query = `SELECT 
            POSTS.id, 
            posts.numVotes, 
            commentCount, 
            profilePicture AS authorProfilePic, 
            posts.title AS title, 
            content, 
            imgSrc, 
            link as postLink, 
            posts.createdAt, 
            boardId, 
            boards.title AS boardName, 
            boardPicture, 
            username as author, 
            posts.userId as authorId, 
            TIMESTAMPDIFF(MINUTE, posts.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation 
        FROM POSTS 
        LEFT JOIN users ON posts.userId = users.id
        LEFT JOIN profiles ON posts.userId = profiles.id
        LEFT JOIN boards on posts.boardId = boards.id
        WHERE posts.deleted = FALSE
        `
    let params = []

    if(boardId)
    {
        query += " AND boardId = ?";
        params.push(boardId);
    }

    if(orderBy == "createdAt" && lastSeen)
    {
        query += " AND POSTS.id < ?";
        params.push(lastSeen)
    }

    if(orderBy == "numVotes" && orderByTime)
    {
        query += `AND POSTS.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${orderByTime})`;
    }

    query += ` ORDER BY ${orderBy} DESC LIMIT ?`;
    params.push(CONFIG.ITEMS_PER_PAGE + 1);

    if(orderBy != "createdAt" || !lastSeen)
    {
        query += " OFFSET ?";
        params.push(newOffset);
    }

    let posts = await queryDb(query, params);
    //let posts = (await dbCon.query(query, params))[0];

    let endOfItems = true;
    if(posts.length > CONFIG.ITEMS_PER_PAGE)
    {
        endOfItems = false;
        posts.pop();
    }

    // Grab post vote data for current user, if provided
    const voteMap = await getPostVoteDirection(userId, posts.map(post => post.id));

    for (let post of posts)
    {
        post.voteDirection = voteMap[post.id];
    }

    return {endOfItems, items: posts};
}
 

/*
    Mark posts as being deleted.

    postId ([int], required): Array of IDs of the posts to mark as being deleted

    returns (int): Amount of posts deleted.
*/
const markPostsAsDeleted = async (postIds) =>
{
    const deleteOp = await queryDb("UPDATE posts SET deleted = TRUE WHERE id IN (?)", [postIds]);
    return deleteOp.affectedRows;
}

/*
    Mark all posts from a specific user as being deleted.

    userId (int, required): ID of the user that will have their posts deleted

    returns (int): Amount of posts deleted.
*/
const markUserPostsAsDeleted = async (userId) => 
{
    const deleteOp = await queryDb("UPDATE posts SET deleted = TRUE WHERE userId = ?", [userId]);
    return deleteOp.affectedRows;
}

/*
    Mark all posts from a specific board as being deleted.

    boardId (int, required): ID of the board that will have its posts deleted

    returns (int): Amount of posts deleted.
*/
const markBoardPostsAsDeleted = async (boardIds) =>
{
    const deleteOp = await queryDb("UPDATE posts SET deleted = TRUE WHERE boardId IN (?)", [boardIds]);
    return deleteOp.affectedRows;
}

module.exports = { 
    markBoardPostsAsDeleted,
    markUserPostsAsDeleted,
    markPostsAsDeleted,
    getAuthorId, 
    loadPostData, 
    insertNewPost, 
    insertPostVote, 
    deletePostVote, 
    updatePostVote, 
    addPostVotes, 
    updatePostRank, 
    getPostVoteDirection, 
    updatePostCommentCount, 
    getPostsByBoard, 
    queryPosts 
};