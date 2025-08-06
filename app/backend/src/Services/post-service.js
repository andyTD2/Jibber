"use strict"

const commentService = require(baseDir + "/src/Services/comment-service");
const userModel = require(baseDir + "/src/Models/user-model");
const postModel = require(baseDir + "/src/Models/post-model");
const boardModel = require(baseDir + "/src/Models/board-model");
const { getDecodedHtmlLength } = require(baseDir + "/src/utils/misc");
const { isValidUrl, getHtml, getArticleImageSrc, getArticleTitle } = require(baseDir + "/src/utils/misc");

/*
    Retrieves a full post, including comments.

    userId (int, optional): ID of the current user
    user (str, optional): Username of the current user
    postId (int, required): ID of the post to retrieve
    offset (int, optional): Number of comments to skip; used for pagination
    lastSeenComment (int, optional): The last seen comment. Any other comments loaded will be after this. Used if sorting by new
    filter (str, optional, default: "top"): Filter method to sort comments by
    boardData (obj, required): Data about the board for which the post belongs to. Typically retrieved by middleware
    postHeadData (obj, required): Metadata about the postHeader. Retrieved by middleware
    postData (obj, required): Additional data about the post, which should've been retrieved by prior middleware

    returns (obj):
        {
            ok (bool): false if error ocurred
            data (obj): {
                board (obj): Board data (see board-middlewares.js)
                postHeader (obj): Post header data (see post-middlewares.js)
                postData (obj): {
                    numRootComments (int): Number of root comments. Root comments are top level comments (ie., not a reply)
                    endOfComments (bool): True if there are no more comments to load
                }
                comments ([obj]): Data returned from commentService.getComments(). See comment-service.js for more
                user (str): Current username
                filter (str): Current filter
            }
        }
*/
const getPostPage = async function (userId, postId, offset, filter = "top", boardData, postHeaderData, postData, user, lastSeenComment, moderator)
{    
    let commentData = await commentService.getComments({userId, postId, offset, filter, lastSeenComment});

    if(postHeaderData.deleted)
    {
        postHeaderData.author = undefined;
        postHeaderData.postLink = undefined;
        postHeaderData.imgSrc = undefined;
        postHeaderData.content = undefined;
        postHeaderData.title = undefined;
    }

    let data = {
        board: boardData,
        postHeader: postHeaderData,
        postData: {numRootComments: postData.numRootComments, endOfComments: commentData.data.endOfComments},
        comments: commentData.data.comments,
        user: user,
        filter: filter,
        moderator: moderator
    };

    return {ok: true, data: data};
};

/*
    Creates a post. Validates user input first.
    - requires active user session

    postTitle (str, required): Title of the new post
    postLink (str, optional): Link to an external website
    useArticleTitle (bool, optional): Set to true if the title should use the postLink's title
    postContent (str, optional): Text content for a post
    boardId (int, required): ID of the board for which the post is being created for
    userId (int, required): ID of the current active user

    returns (obj):
        {
            ok (bool): false if error ocurred
            insertId (int): ID of recently inserted post
        }
*/
const createPost = async function(postTitle, postLink, useArticleTitle, postContent, boardId, userId) {

    if(postTitle.replace(/\s/g, '') == "") 
        return {ok: false, statusCode: 400, error: "Post must have a title!"};

    if(postTitle.length < 3)
        return {ok: false, statusCode: 400, error: "Post title requires a minimum of 3 characters."}

    if(postTitle.length > 300)
        return {ok: false, statusCode: 400, error: "Post title cannot exceed 300 characters."}

    if(postLink && (postLink.length > 0 && !isValidUrl(postLink)) || postLink.length > 5000)
        return {ok: false, statusCode: 400, error: "Invalid link."}

    if(postContent && postContent.length > CONFIG.MAX_LENGTH_POST_CONTENT)
    {
        if( postContent.length > CONFIG.MAX_LENGTH_POST_CONTENT * 3 ||
            getDecodedHtmlLength(postContent) > CONFIG.MAX_LENGTH_POST_CONTENT
        )
            return {ok: false, statusCode: 400, error: `Post body cannot exceed ${CONFIG.MAX_LENGTH_POST_CONTENT} characters.`}
    }

    let metaData = await getArticleMetaData(postLink);
    if(useArticleTitle && !metaData) 
        return {ok: false, statusCode: 400, error: "Unable to fetch article metadata. Please double check the URL."};

    if(useArticleTitle && metaData.articleTitle && metaData.articleTitle != "") postTitle = metaData.articleTitle;

    let insertId = await postModel.insertNewPost(postTitle, postContent, postLink, boardId, userId, metaData && metaData.imgSrc ? metaData.imgSrc : "");
    await boardModel.addNumPosts(boardId, 1);

    return {ok: true, insertId: insertId};
}

/*
    Retrieves title and preview image from an external 3rd party link.

    link (str, required): Link the to 3rd party website

    returns (obj):
        {
            imgSrc (str): link to the image preview scraped from article
            articleTitle (str): Title of the article 
        }
*/
const getArticleMetaData = async function(link)
{
    if(link == "")
    {
        return undefined;
    }

    if(!isValidUrl(link))
    {
        return undefined;
    }

    let dom = await getHtml(link);

    if(dom.error)
    {
        return undefined;
    }

    return {imgSrc: getArticleImageSrc(dom), articleTitle: getArticleTitle(dom)};
};

/*
    Records a user vote on a post.

    userId (int, required): ID of the user who is voting
    postId (int, required): ID of the post that is being voted on
    voteDirection (int, required): Direction of the vote, as an int (1 = up; -1 = down)

    returns (obj):
        {
            ok (bool): false if error ocurred
            changeInVote (int): The change in the post's vote count
        }
*/
const voteOnPost = async function(userId, postId, voteDirection) {
    voteDirection = parseInt(voteDirection);
    if(voteDirection != 1 && voteDirection != -1 && voteDirection != 0)
        return {ok: false, statusCode: 400, error: "Invalid vote direction."}

    let userVote = await postModel.getPostVoteDirection(userId, [postId]);
    let changeInVote = 0;

    userVote = userVote[postId];
    if(userVote == 0) //user hasn't voted on this post; create new vote entry
    {
        await postModel.insertPostVote(userId, postId, voteDirection);
        changeInVote = voteDirection;
    }
    else if (userVote == voteDirection) //clicking the same vote direction again after already voting will undo the vote; we delete this record to undo the vote
    {
        await postModel.deletePostVote(userId, postId);
        changeInVote = -voteDirection;
    }
    else //user wants to change their vote direction; alter existing vote record
    {
        await postModel.updatePostVote(userId, postId, voteDirection);
        if (voteDirection == -1) changeInVote = -2;
        else changeInVote = 2;
    }

    //Need to update numVotes in posts table with the new vote
    await postModel.addPostVotes(postId, changeInVote);

    //Need to update numVotes in users table
    const authorId = await postModel.getAuthorId(postId);
    await userModel.addVotes(authorId, changeInVote);

    //After updating votes, we have to recalculate the rank
    await postModel.updatePostRank(postId);

    return{ok: true, changeInVote: changeInVote};
};

/*
    Searches for posts that match a given search query.

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
            ok (bool): false if error ocurred
            data (obj): Data returned by postModel.queryPosts(). See post-model.js for format
        }
*/
const getSearchResults = async function({filterByCategory, filterByAuthor, lastSeen, searchQuery, offset, filter, timeFilter, userId})
{
    let data = await postModel.queryPosts({
                                                        filterByCategory: filterByCategory ? filterByCategory.split(",") : undefined,
                                                        filterByAuthor: filterByAuthor ? filterByAuthor.split(",") : undefined, 
                                                        lastSeen, 
                                                        offset, 
                                                        filter, 
                                                        timeFilter,
                                                        searchQuery: searchQuery.trim(), 
                                                        userId});

    return {ok: true, data};
}


/*
    Removes posts. Note "removing" a post in this context does NOT delete
    it entirely. It marks the post as "deleted", which will then be hidden from users.

    postIds ([int], required): IDs of the posts to hide

    returns (obj):
    {
        ok (bool): True if post was successfully hidden.
    }
*/
const removePosts = async function({postIds})
{
    if(!postIds || postIds.length < 1)
    {
        return {ok: false, statusCode: 400, error: "Invalid post ID(s)."}
    }

    const removeOp = await postModel.markPostsAsDeleted(postIds);

    if(!removeOp)
    {
        return {ok: false, statusCode: 400, error: "Post ID(s) not found."};
    }
    return {ok: true};
}

module.exports = {removePosts, getPostPage, createPost, voteOnPost, getSearchResults};