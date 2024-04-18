export default function Leftbar(props)
{
    let savedCommunitiesHtml;
    if(props.user)
    {
        savedCommunitiesHtml = props.user.savedCommunities.map((community) => <div className="">&gt; {community}</div>)
    }

    let popularCommunitiesHtml;
    if(props.popularCommunities)
    {
        popularCommunitiesHtml = props.popularCommunities.map((community) => <div className="">&gt; {community}</div>)
    }

    return(
        <div className="bg-zinc-950 px-[2%]">
            <div id="saved-communities">
                <div className="sub-heading">Saved Communities</div>
                {savedCommunitiesHtml}
            </div>
            <div id="popular-communities">
                <div className="sub-heading">Popular Communities</div>
                {popularCommunitiesHtml}
            </div>
        </div>
    )
}
