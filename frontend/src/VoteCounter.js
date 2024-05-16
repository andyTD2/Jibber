const truncateByDecimalPlace = (value, numDecimalPlaces) =>
    (Math.trunc(value * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces)).toFixed(numDecimalPlaces)

export default function VoteCounter({voteCount})
{
    let abreviatedVoteCount = voteCount;
    if(voteCount > 999_999_999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000_000_000, 1)}t`;
    else if(voteCount > 999_999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000_000, 1)}b`;
    else if(voteCount > 999_999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000_000, 1)}m`;
    else if(voteCount > 999) abreviatedVoteCount = `${truncateByDecimalPlace(voteCount / 1_000, 1)}k`;

    return (
        <div className="self-center text-xs">{abreviatedVoteCount}</div>
    )
}