import ContentItem from "./ContentItem"
import {useEffect, useState} from "react"
import { useStore } from "./Store";

export default function Feed(props)
{
    const user = useStore((state) => state.user);
    const feedContent = useStore((state) => state.feedContent);
    const setFeedContent = useStore((state) => state.setFeedContent);

    useEffect(() => {
        const getFeedContent = async () => {
            const response = await fetch("https://localhost:3000/", {
            method: "GET",
            credentials: 'include'
            });
            
            if(response.ok)
            {
                let posts = (await response.json()).posts;
                setFeedContent(posts)   
            }
        }
        getFeedContent();
    }, [user]);


    return(
        <div id="feed-container" className="w-3/5 overflow-y-scroll">
            <div id="feed" className="h-[5000px] bg-zinc-900 p-12 flex flex-col">
                {
                    feedContent &&
                    feedContent.map((contentItem) => <ContentItem key={contentItem.id} contentItem={contentItem}></ContentItem>)
                }
            </div>
        </div>
    )
}