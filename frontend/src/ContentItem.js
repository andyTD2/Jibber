import ButtonXSmallRound from "./ButtonXSmallRound";
import CreatedTimestamp from "./CreatedTimestamp";
import VoteController from "./VoteController"
import { useStore } from "./Store";

export default function ContentItem({contentItem})
{
    const replaceContentItem = useStore((state) => state.replaceContentItem);
    const mergeAndReplaceContentItem = (contentItemChanges) =>
    {
        const newContentItem = Object.assign({}, contentItem, contentItemChanges);
        replaceContentItem(newContentItem);
    }

    return (
        <div className="content-item bg-zinc-950 mb-8 min-h-32 flex flex-row pr-2">
            <VoteController mergeAndReplaceContentItem={mergeAndReplaceContentItem} voteDirection={contentItem.voteDirection} voteCount={contentItem.numVotes} voteHref={`vote/${contentItem.id}`}></VoteController>
            <div className="flex flex-col px-4 py-1 mr-auto w-full">
                <CreatedTimestamp minutesSinceCreation={contentItem.minutesSinceCreation}></CreatedTimestamp>
                <a className="mt-2 text-xl hover:underline" href={contentItem.postLink ? contentItem.postLink : `/r/${contentItem.subredditName}/post/${contentItem.id}`}>{contentItem.title}</a>
                <div className="flex flex-row mt-auto">
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${contentItem.subredditName}/post/${contentItem.id}`} styles="mr-6">{contentItem.numComments} comments</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/r/${contentItem.subredditName}`} styles="mr-6">{contentItem.subredditName}</ButtonXSmallRound>
                    <ButtonXSmallRound onClick={() => window.location.href=`/u/${contentItem.author}`}>{contentItem.author}</ButtonXSmallRound>
                </div>
            </div>
            {<img src={contentItem.imgSrc ? contentItem.imgSrc : "/text-icon.png"} className="size-28 object-cover my-2"></img>}
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