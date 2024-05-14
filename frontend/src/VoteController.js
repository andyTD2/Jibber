const truncateByDecimalPlace = (value, numDecimalPlaces) =>
    (Math.trunc(value * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces)).toFixed(numDecimalPlaces)

export default function VoteController({voteDirection, voteCount, onUpvote, onDownvote})
{
    let abreviatedVoteCount = voteCount;
    if(voteCount > 999_999_999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000_000_000, 1)}t`;
    else if(voteCount > 999_999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000_000, 1)}b`;
    else if(voteCount > 999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000, 1)}m`;
    else if(voteCount > 999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000, 1)}k`;

    return (
        <div className="flex flex-col w-12 h-full bg-zinc-800 justify-center">
            <div className="pb-1 h-full flex flex-row hover:bg-zinc-700"><img className="mx-auto self-end w-6 h-6" src={voteDirection == 1 ? "/up-arrow-green.png" : "/up-arrow.png"}></img></div>
            <div className="self-center text-xs">{abreviatedVoteCount}</div>
            <div className="pt-1 h-full hover:bg-zinc-700"><img className="mx-auto w-6 h-6" src={voteDirection == -1 ? "/down-arrow-magenta.png" : "/down-arrow.png"}></img></div>
        </div>
    )
}