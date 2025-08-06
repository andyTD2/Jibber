import VoteCounter from "./VoteCounter";
import { twMerge } from "tailwind-merge";

import CONFIG from "./config"

/*
    This component handles voting. It renders the vote count and buttons to vote.
    When a user initiates a vote, that information is sent to the server, which then
    responds with the new vote direction and new vote count. We use onVoteChange to then
    update the state in any parent component.

    onVoteChange (func, optional): Callback that is triggered upon successful vote change.
        Called with:

            voteDirection (int, required): New vote direction(-1, 1)
            numVotes (int, required): New vote count
    
    voteDirection (int, required): The current vote direction. Can be -1, 0, or 1 which indicates direction

    voteCount (int, required): The total number of votes.

    relativeVoteRoute (str, required): Relative vote route on the backend. For posts it might be /postVote, or 
        /commentVote for comments

    className (str, optional): optional styling
*/
export default function VoteController({onVoteChange, voteDirection, voteCount, relativeVoteRoute, className})
{   
    /*
        Submits the vote data to the server. Upon success, calls the onVoteChange callback
        with the new voteDirection and the new number of votes
    */
    async function onVote(newVoteDirection, absVoteRoute) {
        const response = await fetch(absVoteRoute, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({direction: newVoteDirection})
        });
    
        if (response.ok)
        {
            let data = await response.json()
            if(onVoteChange)
                onVoteChange({voteDirection: voteDirection + data, numVotes: voteCount + data});
        }
    }

    return (
        <div className={twMerge(`rounded-l-md md:rounded-none flex flex-col min-w-12 max-w-12 color-transition dark:bg-dark3 bg-light4 justify-center overflow-hidden`, className)}>
            <div onClick={() => onVote(1, `${CONFIG.API_URL}/${relativeVoteRoute}`)} className="pb-1 h-full flex flex-row dark:hover:bg-dark4 hover:bg-light5"><img className="mx-auto self-end w-6 h-6" src={voteDirection == 1 ? "/up-arrow-green.png" : "/up-arrow.png"}></img></div>
            <VoteCounter voteCount={voteCount}></VoteCounter>
            <div onClick={() => onVote(-1, `${CONFIG.API_URL}/${relativeVoteRoute}`)} className="pt-1 h-full dark:hover:bg-dark4 hover:bg-light5"><img className="mx-auto w-6 h-6" src={voteDirection == -1 ? "/down-arrow-magenta.png" : "/down-arrow.png"}></img></div>
        </div>
    )
}