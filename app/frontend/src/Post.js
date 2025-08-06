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
import MemoizedComment from "./Comment";
import Filter from "./Filter";
import Button from "./Button";
import ReplyBox from "./ReplyBox";

import CONFIG from "./config"
import { useTitle } from "./hooks/useTitle";
import PostHeader from "./PostHeader";

const validFilters = 
{
    top: "TOP",
    new: "NEW"
};


/*
    Adds a new comment tree to a given root. Duplicate comments are not appended.

    commentMap (map, required) : A map(hash table) containing all comments already present in the tree.
        Used for fast constant time lookups.

    root ([obj], required): The starting node/array to add all comments to.

    newCommentTree ([obj], required): An array that contains the comments that will be added.

    method (str, optional): Set to "unshift" if comments should be added to the front of the root. 
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
    
    root ([obj], required): Array of comments, treated as the root of a tree
    callback (func, required): Callback that receives each comment as its arg
*/
export const applyToAllComments = function(root, callback)
{
    for (let comment of root)
    {
        callback(comment);
        applyToAllComments(comment.comments, callback);
    }
}

/*
    This component is responsible for rendering a Post and all related sub-components and features,
    including the comment feed.
*/
export default function Post({onLoad})
{
    /*
        Fetches content from the server, then performs some comment processing and sets post state.
        Calls any callback provided.

        anon (obj, required): An object containing query params that will be appended to the baseRoute
        callback (func, required): A function that be provided with the results. Will be called at the end.
    */
    const loadContent = async function({filter, offset}, callback)
    {
        setLoading(true);
        //GET request to the backend. Retrieves a post object which contains all data needed to render the entire post
        getData({   baseRoute: `${CONFIG.API_URL}/b/${boardName}/post/${postId}`,
                    queryParams: {"filter": filter, "offset": offset}, 
                    onSuccess: (results) => 
                    {
                        //Add all comments to a hash table for fast lookups
                        results.commentMap = new Map();

                        applyToAllComments( results.comments, 
                                            (comment) => 
                                            {
                                                results.commentMap.set(comment.id, comment)
                                            })

                        //Set post state to the results
                        setPost(results);
                        //Reset the state of the "show more" comments button
                        if(callback)
                            callback(results)

                        setLoading(false);
                    },
                    onFailure: () =>
                    {
                        setLoading(false);
                    }
                });
    }

    const onPostVote = (postId, newVoteData) => {
        setPost((prev) => {
            //Update the post with the new vote 
            let newPost = structuredClone(prev);
            newPost.postHeader = {...newPost.postHeader, ...newVoteData};
            return newPost;
        });
    }

    //States
    const user = useStore((state) => state.user);
    const [post, setPost] = useState(undefined);
    const [loading, setLoading] = useState(false);

    const setLoginModalIsOpen = useStore(state => state.setLoginModalIsOpen);

    //url params inputted by user for navigation
    const [searchParams, setSearchParams] = useSearchParams();
    const {postId, boardName} = useParams();
    const navigate = useNavigate();

    useTitle(post && post.postHeader && post.postHeader.title);

    //Grab data from url
    //User enters a page in the query params, which is converted to an offset(number of comments seen)
    //This retains the "page" functionality which is commonly known, but allows the rest of the code
    //to work with offsets, which is easier than constantly converting page back and forth.
    const initialOffset = getOffsetFromPage(searchParams.get("page"), CONFIG.COMMENTS_PER_PAGE);
    const initialFilter = validateFilter(searchParams.get("filter"), validFilters) || "top";

    // This effect triggers when the user changes(a new user means new vote data which must be fetched)
    useEffect(() => {
        loadContent({filter: initialFilter, offset: initialOffset})
    }, [user]);

    // Effect triggers when post loads.
    useEffect(() => {
        if (post && onLoad && typeof onLoad === 'function')
        {
            onLoad();
        }
    }, [post])

    if(loading)
    {
        return (
            <div className="w-full flex items-center justify-center">
                <img className="mt-[25%] h-12 w-12"src="/spinner-light.svg"></img>
            </div>
        )
    }

    return (
        <div className="w-full flex-2 mb-4">
            {post && <div className="mt-10 lg:mt-4 h-full ml-12 lg:mx-0">
                <PostHeader data={{...post.postHeader, boardName: post.board.title}} hideNumComments={true} hideBoardName={true} className={"-ml-12 lg:mx-0"} boardName={boardName} onVote={onPostVote}></PostHeader>

                <ReplyBox className="mt-4" charLimit={CONFIG.MAX_LENGTH_COMMENT} onSubmit=
                {
                    //When a new comment is posted, send a POST request to backend with the comment data.
                    //On success, prepend the newly added comment to the comment tree contained with the post state object
                    (commentBody, onSuccessfulSubmit, onFailureSubmit) =>
                    {
                        if (!user)
                        {
                            setLoginModalIsOpen(true);
                        }
                        else
                        {
                            postData({  baseRoute: `${CONFIG.API_URL}/b/${boardName}/post/${postId}/newComment`, 
                                body: {comment: commentBody}, 
                                onSuccess: (results) => 
                                {
                                    setPost(prev => {
                                        let newPost = structuredClone(prev);
                                        concatCommentTree(newPost.commentMap, newPost.comments, results, "unshift");
                                        newPost.postData.numRootComments += 1;
                                        newPost.postHeader.commentCount += 1;
                                        return newPost;
                                    })
                                    if(onSuccessfulSubmit)
                                    {
                                        onSuccessfulSubmit();
                                    }
                                },
                                onFailure: (results) => 
                                {
                                    if(onFailureSubmit)
                                        onFailureSubmit(results);
                                }
                            })
                        }
                    }
                }
                clearContentOnSubmit={user}
                />


                <div className="mt-4 border-t-2 border-dashed border-zinc-600 flex justify-between">
                    <Filter 
                        className={"mt-1"}
                        currentFilter={validFilters[initialFilter]}
                        
                        //When filter is updated, load in new content, and replace the url query with
                        //the new filter.
                        updateFilter={(newFilter) => 
                        {
                            loadContent(    {filter: newFilter, offset: 0}, 
                                            () => navigate(`?filter=${newFilter}`, { replace: true }));
                        }}
                        filters={validFilters}/>
                    <div>{post.postHeader.commentCount} comments</div>
                </div>


                {post.comments.map((comment) => 
                    <MemoizedComment
                        moderator={post.moderator}
                        boardId={post.board.id}
                        data={comment} 
                        className={"ml-0"} 
                        setPost={setPost} 
                        key={`${comment.id}`}
                        // This callback is triggered when a new child comment(reply to existing comment) is posted. It is identical
                        // to the one above(tipTapEditor)
                        postComment=
                        {
                            (body, onSuccess, onFailure) => 
                            {
                                postData({  baseRoute: `${CONFIG.API_URL}/b/${boardName}/post/${postId}/newComment`,
                                            body: body,
                                            onSuccess,
                                            onFailure
                                        })
                            }
                        }
                        //This callback is triggered when more child comments need to be loaded from an existing comment.
                        loadComments=
                        {
                            (queryParams, onSuccess) =>
                            {
                                getData({  baseRoute: `${CONFIG.API_URL}/b/${boardName}/post/${postId}/comments`,
                                            queryParams: {...queryParams},
                                            onSuccess: onSuccess
                                })
                            }
                        }
                    ></MemoizedComment>)
                }

                {/* When this button is clicked, load more comments into the comment tree.*/}
                {!post.postData.endOfComments && 
                <Button handleClick=
                {
                    () => 
                    {
                        getData(
                        {   
                            baseRoute: `${CONFIG.API_URL}/b/${boardName}/post/${postId}/comments`,
                            queryParams: {"filter": initialFilter, offset: post.comments.length + initialOffset, "lastSeen": post.comments[post.comments.length - 1] && post.comments[post.comments.length - 1].id},
                            onSuccess: (results) => 
                            {
                                setPost((prev) => {
                                    let newPost = structuredClone(prev);
                                    newPost.postData.endOfComments = results.endOfComments;
                                    concatCommentTree(newPost.commentMap, newPost.comments, results.comments);
                                    return newPost;
                                })
                            }
                        })
                    }
                }
                className="w-full mt-4 bg-light1 hover:bg-light2 active:bg-light4">SHOW MORE</Button>}
            </div>}
        </div>
    )
}

export const MemoizedPost = memo(Post);