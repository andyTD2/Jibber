import VoteCounter from "./VoteCounter";

export default function VoteController({mergeAndReplaceContentItem, voteDirection, voteCount, voteHref})
{
    async function onVote(newVoteDirection, voteHref) {
        const response = await fetch(voteHref, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({direction: newVoteDirection})
        });
    
        if (response.ok)
        {
            let data = await response.json()
            mergeAndReplaceContentItem({voteDirection: voteDirection + data, numVotes: voteCount + data});
        }
    }

    return (
        <div className="flex flex-col w-12 h-full bg-zinc-800 justify-center">
            <div onClick={() => onVote(1, `https://localhost:3000/${voteHref}`)} className="pb-1 h-full flex flex-row hover:bg-zinc-700"><img className="mx-auto self-end w-6 h-6" src={voteDirection == 1 ? "/up-arrow-green.png" : "/up-arrow.png"}></img></div>
            <VoteCounter voteCount={voteCount}></VoteCounter>
            <div onClick={() => onVote(-1, `https://localhost:3000/${voteHref}`)}className="pt-1 h-full hover:bg-zinc-700"><img className="mx-auto w-6 h-6" src={voteDirection == -1 ? "/down-arrow-magenta.png" : "/down-arrow.png"}></img></div>
        </div>
    )
}