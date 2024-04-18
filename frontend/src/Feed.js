import ContentItem from "./ContentItem"

export default function Feed(props)
{

    let contentItemsHtml = props.contentItems.map((contentItem) => <ContentItem>{contentItem}</ContentItem>)

    return(
        <div id="feed-container" className="w-3/5 overflow-y-scroll">
            <div id="feed" className="h-[5000px] bg-zinc-900 pl-24">
                {contentItemsHtml}
            </div>
        </div>
    )
}