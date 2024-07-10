import VoteController from "./VoteController"
import CreatedTimestamp from "./CreatedTimestamp";
import ButtonXSmallRound from "./ButtonXSmallRound";
import { useStore } from "./Store";
import { twMerge } from "tailwind-merge";

export default function PostHeader({postHeaderData, subredditName, className})
{
    const setPost = useStore((state) => state.setPost);
    let {title, id, voteDirection, numVotes, imgSrc, author, content, minutesSinceCreation, numComments} = postHeaderData;
    const setContentItemInFeed = useStore((state) => state.setContentItemInFeed);

    return (
        <div className={twMerge("flex bg-zinc-950 rounded-r-md", className)}>
            <div className="bg-zinc-900 flex flex-col">
                <VoteController
                    onVoteChange={(newVoteData) => {
                        setContentItemInFeed(id, newVoteData);
                        let curPost = useStore.getState().post;
                        setPost({...curPost, postHeader: {...curPost.postHeader, ...newVoteData}}); 
                    }} 
                    voteDirection={voteDirection} voteCount={numVotes} relativeVoteRoute={`vote/${id}`}
                    className="max-h-48 rounded-bl-none flex-1">
                </VoteController>
            </div>
            <div className="flex flex-col w-full px-4 py-1">
                <CreatedTimestamp minutesSinceCreation={minutesSinceCreation}></CreatedTimestamp>
                <div className="mt-2 text-xl">{title}</div>
                <div className="mt-2">super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three super long test one two three </div>
                <div className="flex flex-row mt-8 mb-2">
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${subredditName}/post/${id}`} className="mr-6">{numComments} comments</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${subredditName}`} className="mr-6">{subredditName}</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/u/${author}`}>{author}</ButtonXSmallRound>
                </div>
            </div>
            <img src={imgSrc} className="size-28 object-cover m-2"></img>
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