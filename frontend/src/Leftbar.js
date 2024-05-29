import {useStore} from './Store';

export default function Leftbar(props)
{
    const user = useStore((state) => state.user);
    const subscriptionsList = useStore((state) => state.subscriptionsList);

    let savedCommunitiesHtml;
    if(user)
    {
        savedCommunitiesHtml = subscriptionsList.map((subscription) => <div className="">&gt; {subscription.title}</div>)
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
