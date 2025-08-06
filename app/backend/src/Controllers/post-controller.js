const postService = require(baseDir + "/src/Services/post-service");

/*
    Handles requests for retrieving a post
    - requires valid board and post data, which should be retrieved by middlewares

    URL param args:
        postId (int, required): ID of the post to get
        
    queryParam args:
        offset (int, optional): Number of comments to skip; used for pagination
        filter (str, required): The filter method to sort comments by
        lastSeen (int, optional): ID of the last seen comment, if sorting comments by new

*/
const handlePostPageRequest = async function (req, res)
{
    let post = await postService.getPostPage(req.session.userID, req.params.postId, req.query.offset, 
                                            req.query.filter, req.boardData, req.postHeaderData, req.postData, req.user, req.query.lastSeen, req.moderator);

    if(!post.ok)
    {
        res.status(post.statusCode).send(post.error);
        return;
    }

    res.send(post.data);
}

/*
    Handles requests for creating new posts.
    - requires active user session
    - requires valid boardData
    - see middlewares for more info

    body args:
        postTitle (str, required): Title of the new post
        postLink (str, required): hyperlink of the post
        useArticleTitle (bool, optional): set truthy to use article title as the new post title
        postContent (str, optional): Text content of the post
*/
const handleNewPostRequest = async function(req, res) { 
    let newPost = await postService.createPost(req.body.postTitle, req.body.postLink, req.body.useArticleTitle, 
                                                req.body.postContent, req.boardData.id, req.session.userID)

    if (!newPost.ok)
    {
        res.status(newPost.statusCode).send({ error: newPost.error });
        return;
    }
    res.status(200).send({postId: newPost.insertId});
}

/*
    Handles requests for voting on a post
    - requires active user session

    URL param args:
        postId (int, required): ID of the post being voted on

    body args:
        direction (int, required): Direction of the vote, represented by an int (1 = up; -1 = down)
*/
const handlePostVoteRequest = async function(req, res) {
    let postVote = await postService.voteOnPost(req.session.userID, req.params.postId, req.body.direction);
    if(!postVote.ok)
    {
        res.status(postVote.statusCode).send(postVote.error);
        return;
    }

    res.send(`${postVote.changeInVote}`);
};

/*
    Handles requests for search queries on posts

    queryParam args:
        lastSeen (int, optional): Last seen post ID, used to skip post results for pagination when filtering by new.
        offset (int, required): Offset is used to skip a set amount of results; used for pagination
        q (str, required): Search query
        filter (str, required): Filter method to sort results by
        t (str, required): Time filter method to sort results by
        filterByCategory (str, optional): Category filter method to sort results by. Filters results in a certain board.
        filterByAuthor (str, optional): Author filter method to sort results by.
*/
const handleSearchResultsRequest = async function(req, res) 
{
    const results = await postService.getSearchResults({
                                                        lastSeen: req.query.lastSeen,
                                                        searchQuery: req.query.q,
                                                        offset: req.query.offset,
                                                        filter: req.query.filter,
                                                        timeFilter: req.query.t,
                                                        userId: req.session.userID,
                                                        filterByCategory: req.query.categories,
                                                        filterByAuthor: req.query.authors
                                                    })
    if(results.ok)
    {
        res.status(200).send(results.data);
        return;
    }
};

/*
    Deletes a specific post.
    - requires active user session
    - requires "CONTENT_MODERATION" permissions for specified board

    body args: 
    {
        postId (int, required): ID of the post to delete
    }
*/
const handleDeletePostRequest = async function(req, res)
{
    const deleteRequest = await postService.removePosts({postIds: [req.body.postId]});
    if(!deleteRequest.ok)
    {
        res.status(deleteRequest.statusCode).send(deleteRequest.error);
        return;
    }
    res.status(200).send({status: "SUCCESS"});
}

module.exports = { 
    handleDeletePostRequest,
    handlePostPageRequest, 
    handleNewPostRequest, 
    handlePostVoteRequest, 
    handleSearchResultsRequest 
};