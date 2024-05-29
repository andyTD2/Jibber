import ContentItem from "./ContentItem"
import {useEffect, useState} from "react"
import { useStore } from "./Store";
import { useParams } from "react-router-dom";
import Filter from "./Filter";

export default function Feed(props)
{
    const user = useStore((state) => state.user);
    const feedContent = useStore((state) => state.feedContent);
    const setFeedContent = useStore((state) => state.setFeedContent);
    const {subreddit} = useParams();
    const [currentFilter, setCurrentFilter] = useState("TOP")

    
    useEffect(() => {
        const getFeedContent = async (subreddit) => {
            const feedRoute = subreddit ? `https://localhost:3000/r/${subreddit}` : `https://localhost:3000/`;
            const response = await fetch(feedRoute, {
            method: "GET",
            credentials: 'include'
            });
            
            if(response.ok)
            {
                let posts = (await response.json()).posts;
                setFeedContent(posts)   
            }
        }
        getFeedContent(subreddit);
    }, [user]);


    return(
        <div id="feed-container" className="w-3/5 px-12 pt-2 overflow-y-scroll">
            <Filter currentFilter={currentFilter} setCurrentFilter={setCurrentFilter} filters={["TOP", "NEW", "HOT"]}></Filter>
            <div id="feed" className="h-[5000px] flex flex-col">
                {
                    feedContent &&
                    feedContent.map((contentItem) => <ContentItem key={contentItem.id} contentItem={contentItem}></ContentItem>)
                }
            </div>
        </div>
    )
}