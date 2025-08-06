const postModel = require(baseDir + "/src/Models/post-model");

/*
    Retrieves data related to the posts. Does not retrieve comments.

    URL param args:
        postId (int, required): ID of the post to retrieve
*/
const getPost = async function(req, res, next)
{
    const postData = await postModel.loadPostData(req.session.userID, req.params.postId);
    if(!postData)
    {
        res.status(404).send("Page not found.");
        return;
    }

    req.postHeaderData = 
    {
        id: req.params.postId,
        title: postData.title,
        content: postData.content,
        numVotes: postData.numVotes,
        authorId: postData.userId,
        author: postData.author,
        authorProfilePic: postData.authorProfilePic,
        minutesSinceCreation: postData.minutesSinceCreation,
        voteDirection: postData.voteDirection,
        commentCount: postData.commentCount,
        postLink: postData.postLink,
        imgSrc: postData.imgSrc,
        deleted: postData.deleted
    };

    req.postData = {
        numRootComments: postData.rootCommentCount
    };
    
    next();
};

module.exports = { getPost };