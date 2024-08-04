import VoteController from "./VoteController"
import CreatedTimestamp from "./CreatedTimestamp";
import HTMLBearingDiv from "./HTMLBearingDiv";
import { twMerge } from "tailwind-merge";
import { Link } from "react-router-dom";

export default function PostHeader({postHeaderData, className, setPost})
{
    let {title, id, voteDirection, numVotes, imgSrc, author, content, minutesSinceCreation, postLink, numComments} = postHeaderData;

    return (
        <div className={twMerge("flex bg-zinc-950 rounded-r-md", className)}>
            <div className="bg-zinc-900 flex flex-col">

                <VoteController
                    onVoteChange={(newVoteData) => {
                        setPost((prev) => {
                            let newPost = structuredClone(prev);
                            newPost.postHeader = {...newPost.postHeader, ...newVoteData};
                            return newPost;
                        });
                    }} 
                    voteDirection={voteDirection} voteCount={numVotes} relativeVoteRoute={`vote/${id}`}
                    className="max-h-48 rounded-bl-none flex-1">
                </VoteController>

            </div>

            {/* Post header content */}
            <div className="flex flex-col w-full px-4 py-1">
                <CreatedTimestamp minutesSinceCreation={minutesSinceCreation}>by <Link to={`/u/${author}`} className="hover:underline">{author}</Link></CreatedTimestamp>
                {postLink && <a href={postLink}><div className="mt-2 text-xl hover:underline">{title}</div></a>}
                {!postLink && <div className="mt-2 text-xl">{title}</div>}
                <HTMLBearingDiv className="mt-2" htmlContent={content}></HTMLBearingDiv>
                <div className="flex flex-row mt-8 mb-2">
                    {/* <Button handleClick={() => window.location.href=`/u/${author}`}>Share</Button>
                    <Button handleClick={() => window.location.href=`/u/${author}`}>Save</Button> */}
                </div>
            </div>

            {/* If the post has an article, and the article has a preview image, show the preview image */}
            {<img src={imgSrc ? imgSrc : "/text-icon.png"} className="size-28 object-cover m-2"></img>}

        </div>
    )
}

/*
postHeaderData: 
    content: "awd"
    id: "76"
    imgSrc: ""
    minutesSinceCreation: 309465
    numComments: 1
    numVotes: 2
    postLink: ""
    title: "something test"
    authorId: 13
    author: "FOUR"
    voteDirection: 0
*/