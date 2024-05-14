import ButtonXSmallRound from "./ButtonXSmallRound";
import CreatedTimestamp from "./CreatedTimestamp";
import VoteController from "./VoteController"

export default function ContentItem({itemData})
{
    return (
        <div className="content-item bg-zinc-950 mb-8 min-h-32 flex flex-row pr-2">
            <VoteController voteDirection={itemData.voteDirection} voteCount={itemData.numVotes}></VoteController>
            <div className="flex flex-col px-4 py-1 mr-auto w-full">
                <CreatedTimestamp minutesSinceCreation={itemData.minutesSinceCreation}></CreatedTimestamp>
                <a className="mt-2 text-xl hover:underline" href={itemData.postLink ? itemData.postLink : `/r/${itemData.subredditName}/post/${itemData.id}`}>{itemData.title}</a>
                <div className="flex flex-row mt-auto">
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${itemData.subredditName}/post/${itemData.id}`} styles="mr-6">{itemData.numComments} comments</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${itemData.subredditName}`} styles="mr-6">{itemData.subredditName}</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/u/${itemData.author}`}>{itemData.author}</ButtonXSmallRound>
                </div>
            </div>
            {<img src={itemData.imgSrc ? itemData.imgSrc : "/text-icon.png"} className="size-28 object-cover my-2"></img>}
        </div>
    );
}

//content: "teadwadw"
// created_at: "2023-12-08T01:35:25.000Z"
// id: 80
// imgSrc: ""
// minutes_ago: 222389
// numComments: 0
// numVotes: 1
// postLink: ""
// subredditName: "testSub3"
// subreddit_id: 3
// timeSinceCreation: "5 months ago"
// title: "testing"
// userName : "FOUR"
// voteDirection : 0
//