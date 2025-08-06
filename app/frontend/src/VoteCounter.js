/*
    Truncates decimal places.

    value (int, required): The raw value to truncate from

    numDecimalPlaces (int, required): The number of decimal places to which the 
        input number will be truncated.
*/
const truncateByDecimalPlace = (value, numDecimalPlaces) =>
    (Math.trunc(value * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces)).toFixed(numDecimalPlaces)

/*
    Condenses a vote count into an abbreviated, compact version.

    voteCount (int, required): The raw vote count to be abbreviated
*/
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