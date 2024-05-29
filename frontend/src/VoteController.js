import VoteCounter from "./VoteCounter";
import { useStore } from "./Store";

export default function VoteController({onVoteChange, voteDirection, voteCount, relativeVoteRoute})
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
            onVoteChange({voteDirection: voteDirection + data, numVotes: voteCount + data});
        }
    }

    return (
        <div className="flex flex-col w-12 bg-zinc-800 justify-center">
            <div onClick={() => onVote(1, `https://localhost:3000/${relativeVoteRoute}`)} className="pb-1 h-full flex flex-row hover:bg-zinc-700"><img className="mx-auto self-end w-6 h-6" src={voteDirection == 1 ? "/up-arrow-green.png" : "/up-arrow.png"}></img></div>
            <VoteCounter voteCount={voteCount}></VoteCounter>
            <div onClick={() => onVote(-1, `https://localhost:3000/${relativeVoteRoute}`)} className="pt-1 h-full hover:bg-zinc-700"><img className="mx-auto w-6 h-6" src={voteDirection == -1 ? "/down-arrow-magenta.png" : "/down-arrow.png"}></img></div>
        </div>
    )
}