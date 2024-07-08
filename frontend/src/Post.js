import { useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import { useStore } from "./Store";
import { useParams } from "react-router-dom";
import CommentFeed from "./CommentFeed";
import TipTapEditor from "./TipTapEditor";

export default function Post(props)
{
    const user = useStore((state) => state.user);
    // const post = useStore((state) => state.post);
    // const setPost = useStore((state) => state.setPost);
    const [post, setPost] = useState(undefined);
    const {postId, subreddit} = useParams();

    useEffect(() => {
        const getPostContent = async (postId) => {
            const response = await fetch(`https://localhost:3000/r/${subreddit}/post/${postId}`, {
            method: "GET",
            credentials: 'include'
            });
            
            if(response.ok)
            {
                let res = (await response.json());
                setPost(res.params) 
            }
        }
        console.log("fetching post");
        getPostContent(postId);
    }, [user]);

    console.log("post render:", post)
    return (
        <div className="w-full">
            <div className="mt-10 h-full">
                {post && <PostHeader postHeaderData={post.postHeader} subredditName={post.subreddit.name}></PostHeader>}
                {post && <TipTapEditor className="mt-4"></TipTapEditor>}
                {post && <CommentFeed comments={post.comments} setPost={setPost}></CommentFeed>}
            </div>
        </div>
    )
}