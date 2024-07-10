import { useEffect, useRef, useState } from "react";
import PostHeader from "./PostHeader";
import { useStore } from "./Store";
import { useParams, useSearchParams } from "react-router-dom";
import Comment from "./Comment";
import TipTapEditor from "./TipTapEditor";
import Filter from "./Filter";
import ButtonSmallRound from "./ButtonSmallRound";

const validFilters = new Set(["top", "new"]);

export default function Post(props)
{
    const user = useStore((state) => state.user);
    const [post, setPost] = useState(undefined);
    const [showMoreVisible, setShowMoreVisible] = useState(true);

    const {postId, subreddit} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    let currentFilter = useRef("top"); //default filter
    let currentPage = useRef(1);

    const fetchPostContent = async (baseRoute, queryParams, onSuccess) => 
    {
        if(queryParams)
        {
            baseRoute += "?";
            for (const [key, value] of Object.entries(queryParams))
            {
                baseRoute += `${key}=${value}&`
            }
        }
        console.log("route", baseRoute);

        const response = await fetch(baseRoute, {
        method: "GET",
        credentials: 'include'
        });
        
        if(response.ok)
        {
            let result = (await response.json());
            onSuccess(result);
        }
    }

    const postComment = async (body, onSuccess) =>
    {
        const response = await fetch(`https://localhost:3000/r/${subreddit}/post/${postId}/newComment`, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify(body)
        });

        if(response.ok)
        {
            let results = await response.json();
            onSuccess(results)
        }
    }


    useEffect(() => {
        const newPage = searchParams.get("page");
        if(!isNaN(newPage) && newPage != null)
            currentPage.current = parseInt(newPage)
        else
            currentPage.current = 1;

        const newFilter = searchParams.get("filter");
        if(newFilter && validFilters.has(newFilter.toLowerCase()))
            currentFilter.current = newFilter.toLowerCase()

        fetchPostContent(   `https://localhost:3000/r/${subreddit}/post/${postId}`, 
                            {"filter": currentFilter.current, "page": currentPage.current}, 
                            (results) => 
                            {
                                //React will batch update states if i put them here
                                setPost(results); 
                                setShowMoreVisible(true)
                                currentPage.current += 1;
                            });

    }, [user, searchParams]);

    console.log("post render:", post)
    return (
        <div className="w-full">
            {post && 
            <div className="mt-10 h-full ml-12">
                <PostHeader postHeaderData={post.postHeader} subredditName={post.subreddit.name} className={"-ml-12"}></PostHeader>
                <TipTapEditor className="mt-4" onSubmit={(commentBody) => postComment({comment: commentBody}, (results) => {
                    setPost(prev => {
                        let newPost = structuredClone(prev);
                        newPost.comments.unshift(results);
                        return newPost;
                    })
                })}></TipTapEditor>

                <div className="mt-4 border-t-2 border-dashed border-zinc-600 flex justify-between">
                    <Filter 
                        currentFilter={currentFilter.current} 
                        updateFilter={(newFilter) => {
                            setSearchParams((searchParams) => {
                                searchParams.set("filter", newFilter);
                                searchParams.delete("page"); 
                                return searchParams
                            })
                        }}
                        filters={Array.from(validFilters)}/>
                    <div>{post.postHeader.numComments} comments</div>
                </div>

                {post.comments.map((comment) => <Comment data={comment} className={"ml-0"} setPost={setPost} postComment={postComment} key={comment.id}></Comment>)}
                {showMoreVisible && <ButtonSmallRound theme="dark" handleClick=
                {
                    () => {
                        fetchPostContent(`https://localhost:3000/r/${subreddit}/post/${postId}/comments`, {"filter": currentFilter.current, "page": currentPage.current}, (results) => {
                            setPost((prev) => {
                                let newPost = structuredClone(prev);
                                newPost.comments.push(...results.comments);
                                return newPost;
                            })
                            currentPage.current += 1;
                            if (results.comments.length == 0)
                            {
                                setShowMoreVisible(false);
                            }
                        })
                    }
                } 
                className="w-full mt-4">SHOW MORE</ButtonSmallRound>}
            </div>}
        </div>
    )
}