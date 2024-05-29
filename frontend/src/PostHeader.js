import VoteController from "./VoteController"
import CreatedTimestamp from "./CreatedTimestamp";
import ButtonXSmallRound from "./ButtonXSmallRound";
import { useStore } from "./Store";

export default function PostHeader({postHeaderData, subredditName})
{
    const setPost = useStore((state) => state.setPost);
    let {title, id, voteDirection, numVotes, imgSrc, author, content, minutesSinceCreation, numComments} = postHeaderData;
    const setContentItemInFeed = useStore((state) => state.setContentItemInFeed);

    return (
        <div className="bg-zinc-950 flex flex-col">
            <div className="flex w-full">
                <VoteController
                    onVoteChange={(newVoteData) => {
                        setContentItemInFeed(id, newVoteData);
                        let curPost = useStore.getState().post;
                        setPost({...curPost, postHeader: {...curPost.postHeader, ...newVoteData}}); 
                    }} 
                    voteDirection={voteDirection} voteCount={numVotes} relativeVoteRoute={`vote/${id}`}>
                </VoteController>
                <div className="flex flex-col w-full px-4 py-1">
                    <CreatedTimestamp minutesSinceCreation={minutesSinceCreation}></CreatedTimestamp>
                    <div className="mt-2 text-xl">{title}</div>
                </div>
                <img src={imgSrc} className="size-28 object-cover m-2"></img>
            </div>
            <div>{content}</div>
            <div className="flex flex-row mt-auto">
                        <ButtonXSmallRound onClick={() => window.location.href=`/r/${subredditName}/post/${id}`} styles="mr-6">{numComments} comments</ButtonXSmallRound>
                        <ButtonXSmallRound onClick={() => window.location.href=`/r/${subredditName}`} styles="mr-6">{subredditName}</ButtonXSmallRound>
                        <ButtonXSmallRound onClick={() => window.location.href=`/u/${author}`}>{author}</ButtonXSmallRound>
            </div>
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