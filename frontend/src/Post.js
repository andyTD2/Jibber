//Hooks
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useStore } from "./Store";
import { useNavigate } from "react-router-dom";

//Utils
import { getData, postData } from "./utils/fetch";
import { memo } from "react";
import { validateFilter, getOffsetFromPage } from "./utils/queryParams";

//Components
import PostHeader from "./PostHeader";
import MemoizedComment from "./Comment";
import TipTapEditor from "./TipTapEditor";
import Filter from "./Filter";
import Button from "./Button";

const validFilters = new Set(["top", "new"]);
const MAX_COMMENTS_PER_PAGE = 20;


/*
    Adds a new comment tree to a given root. Duplicate comments are not appended.

    @param commentMap -> map : A map(hash table) containing all comments already present in the tree.
        Used for fast constant time lookups.
    @param root -> array: The starting node/array to add all comments to.
    @param newCommentTree -> array: An array that contains the comments that will be added.
    @param method -> str [optional]: Set to "unshift" if comments should be added to the front of the root. 
*/
export const concatCommentTree = function(commentMap, root, newCommentTree, method="append")
{
    for(let comment of newCommentTree)
    {
        if(!commentMap.get(comment.id))
        {
            if(method == "unshift") 
                root.unshift(comment);
            else 
                root.push(comment);

            commentMap.set(comment.id, comment);
            applyToAllComments(comment.comments, (comment) => commentMap.set(comment.id, comment))
        }
    }
}

/*
    Apply a callback function to all comments in a subtree starting at root
    
    @param root -> array: Array of comments, treated as the root of a tree
    @param callback -> fn: Callback that receives each comment as its arg
*/
export const applyToAllComments = function(root, callback)
{
    for (let comment of root)
    {
        callback(comment);
        applyToAllComments(comment.comments, callback);
    }
}


export default function Post()
{
    /*
        Fetches content from the server, then performs some comment processing and sets post state.
        Calls any callback provided.

        @param anon -> obj: An object containing query params that will be appended to the baseRoute
        @param callback -> fn: A function that be provided with the results. Will be called at the end.
    */
    const loadContent = async function({filter, offset}, callback)
    {
        //GET request to the backend. Retrieves a post object which contains all data needed to render the entire post
        getData({   baseRoute: `https://localhost:3000/r/${subreddit}/post/${postId}`,
                    queryParams: {"filter": filter, "offset": offset}, 
                    onSuccess: (results) => 
                    {
                        //Add all comments to a hash table for fast lookups
                        results.commentMap = new Map();

                        applyToAllComments( results.comments, 
                                            (comment) => 
                                            {
                                                results.commentMap.set(comment.id, comment)
                                                comment.processedComments = comment.comments.length;
                                            })
                        
                        //See Comment.js for explanation on what processedComments is for
                        results.processedComments = results.comments.length;

                        //Set post state to the results
                        setPost(results);

                        //Reset the state of the "show more" comments button
                        if(callback)
                            callback(results)
                    }
                });
    }

    //States
    const user = useStore((state) => state.user);
    const [post, setPost] = useState(undefined);

    //url params inputted by user for navigation
    const [searchParams, setSearchParams] = useSearchParams();
    const {postId, subreddit} = useParams();
    const navigate = useNavigate();

    //Grab data from url
    //User enters a page in the query params, which is converted to an offset(number of comments seen)
    //This retains the "page" functionality which is commonly known, but allows the rest of the code
    //to work with offsets, which is easier than constantly converting page back and forth.
    const initialOffset = getOffsetFromPage(searchParams.get("page"), MAX_COMMENTS_PER_PAGE);
    const initialFilter = validateFilter(searchParams.get("filter"), validFilters) || "top";

    //See Comment.js for an explanation on how processedComments is used
    let showMoreVisible = false;
    if(post)
    {
        showMoreVisible = post.processedComments + initialOffset < post.postData.numRootComments;
    }

    // This effect triggers when the user changes(a new user means new vote data which must be fetched)
    useEffect(() => {
        loadContent({filter: initialFilter, offset: initialOffset})
    }, [user]);

    console.log("post render:", post)


    return (
        <div className="w-full">
            {post && <div className="mt-10 h-full ml-12">
                <PostHeader postHeaderData={post.postHeader} className={"-ml-12"} setPost={setPost}></PostHeader>

                <TipTapEditor className="mt-4" onSubmit=
                {
                    //When a new comment is posted, send a POST request to backend with the comment data.
                    //On success, prepend the newly added comment to the comment tree contained with the post state object
                    (commentBody) => 
                    postData({  baseRoute: `https://localhost:3000/r/${subreddit}/post/${postId}/newComment`, 
                                body: {comment: commentBody}, 
                                onSuccess: (results) => 
                                {
                                    setPost(prev => {
                                        let newPost = structuredClone(prev);
                                        applyToAllComments(results, (comment) => comment.processedComments = comment.comments.length);
                                        concatCommentTree(newPost.commentMap, newPost.comments, results, "unshift");
                                        newPost.postData.numRootComments += 1;
                                        newPost.postHeader.numComments += 1;
                                        newPost.processedComments += 1;
                                        return newPost;
                                    })
                                }
                            })
                }/>


                <div className="mt-4 border-t-2 border-dashed border-zinc-600 flex justify-between">
                    <Filter 
                        currentFilter={initialFilter}
                        
                        //When filter is updated, load in new content, and replace the url query with
                        //the new filter.
                        updateFilter={(newFilter) => 
                        {
                            loadContent(    {filter: newFilter, offset: 0}, 
                                            () => navigate(`?filter=${newFilter}`, { replace: true }));
                        }}
                        filters={Array.from(validFilters)}/>
                    <div>{post.postHeader.numComments} comments</div>
                </div>


                {post.comments.map((comment) => 
                    <MemoizedComment 
                        data={comment} 
                        className={"ml-0"} 
                        setPost={setPost} 
                        key={`${comment.id}`}
                        // This callback is triggered when a new child comment(reply to existing comment) is posted. It is identical
                        // to the one above(tipTapEditor)
                        postComment=
                        {
                            (body, onSuccess) => 
                            {
                                postData({  baseRoute: `https://localhost:3000/r/${subreddit}/post/${postId}/newComment`,
                                            body: body,
                                            onSuccess: onSuccess
                                        })
                            }
                        }
                        //This callback is triggered when more child comments need to be loaded from an existing comment.
                        loadComments=
                        {
                            (queryParams, onSuccess) =>
                            {
                                getData({  baseRoute: `https://localhost:3000/r/${subreddit}/post/${postId}/comments`,
                                            queryParams: {...queryParams},
                                            onSuccess: onSuccess
                                })
                            }
                        }
                    ></MemoizedComment>)
                }

                {/* When this button is clicked, load more comments into the comment tree.*/}
                {showMoreVisible && 
                <Button handleClick=
                {
                    () => 
                    {
                        getData(
                        {   
                            baseRoute: `https://localhost:3000/r/${subreddit}/post/${postId}/comments`,
                            queryParams: {"filter": initialFilter, offset: post.comments.length + initialOffset, "lastSeen": post.comments[post.comments.length - 1] && post.comments[post.comments.length - 1].id},
                            onSuccess: (results) => 
                            {
                                setPost((prev) => {
                                    let newPost = structuredClone(prev);
                                    applyToAllComments(results.comments, (comment) => comment.processedComments = comment.comments.length);
                                    concatCommentTree(newPost.commentMap, newPost.comments, results.comments);
                                    newPost.processedComments += results.comments.length;
                                    return newPost;
                                })
                            }
                        })
                    }
                }
                className="w-full mt-4">SHOW MORE</Button>}
            </div>}
        </div>
    )
}

export const MemoizedPost = memo(Post);