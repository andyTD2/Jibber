import Comment from "./Comment.js";

export default function CommentFeed({comments, setPost})
{
    return(
        <>
            {comments && comments.map((comment) => <Comment data={comment} className={"ml-0"} setPost={setPost}></Comment>)}
        </>
    )
}