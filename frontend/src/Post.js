import { useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import { useStore } from "./Store";
import { useParams } from "react-router-dom";

export default function Post(props)
{
    const user = useStore((state) => state.user);
    const post = useStore((state) => state.post);
    const setPost = useStore((state) => state.setPost);
    const {postId} = useParams();

    useEffect(() => {
        const getPostContent = async (postId) => {
            const response = await fetch(`https://localhost:3000/r/testSub3/post/${postId}`, {
            method: "GET",
            credentials: 'include'
            });
            
            if(response.ok)
            {
                let res = (await response.json());
                setPost(res.params) 
            }
        }
        getPostContent(postId);
    }, [user]);

    console.log("post render:", post)
    return (
        <div className="w-3/5">
            <div className="p-12 h-full">
                {post && <PostHeader postHeaderData={post.postHeader} subredditName={post.subreddit.name}></PostHeader>}
            </div>
        </div>
    )
}