import ContentItem from "./ContentItem"
import {useEffect, useState} from "react"

export default function Feed(props)
{
    let [posts, setPosts] = useState();

    useEffect(() => {
        console.log("getting main");
        const getFeedContent = async () => {
            const response = await fetch("https://localhost:3000/", {
            method: "GET",
            credentials: 'include'
            });
            
            console.log(response);
            if(response.ok)
            {
                setPosts((await response.json()).posts)   
            }
        }
        getFeedContent();
    }, []);


    return(
        <div id="feed-container" className="w-3/5 overflow-y-scroll">
            <div id="feed" className="h-[5000px] bg-zinc-900 p-12 flex flex-col">
                {
                    posts &&
                    posts.map((post) => <ContentItem itemData={post}></ContentItem>)
                }
            </div>
        </div>
    )
}