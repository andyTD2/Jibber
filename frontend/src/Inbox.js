import Button from "./Button";
import Message from "./Message";

import { useEffect } from "react";
import { useStore } from "./Store";
import { getData, postData } from "./utils/fetch";
import { useFeed } from "./hooks/feed";

import { useState } from "react";

export default function Inbox()
{
    const [activeTab, setActiveTab] = useState("inbox");
    const {feed, modifyFeedItem, mergeFeed, replaceFeed} = useFeed();
    const user = useStore((state) => state.user);
    const subtractMessageNotifications = useStore(state => state.subtractMessageNotifications);

    const appendReply = (id, newReply) =>
    {
        const replyList = feed.itemMap.get(id).replies;
        modifyFeedItem(id, {replies: [...replyList, newReply]})
    }

    const getMessages = (queryParams, onSuccess) =>
    {
        getData({
            baseRoute: "https://localhost:3000/inbox",
            queryParams,
            onSuccess
        })
    }

    const setMessagesToRead = () => 
    {
        if(!feed.items) return;
            
        let readMessageIds = [];
        for(let message of feed.items)
        {
            if(message.recipient_name == user && message.status == "unread")
            {
                message.status = "read";
                readMessageIds.push(message.id);
            }
            for(let reply of message.replies)
            {
                if(reply.recipient_name == user && reply.status == "unread")
                {
                    reply.status = "read";
                    readMessageIds.push(reply.id);
                }
            }
        }
        if(readMessageIds.length < 1) return;

        postData({
            baseRoute: "https://localhost:3000/setMessageStatus",
            body: {messageIds: readMessageIds, newStatus: "read"},
            onSuccess: () => {subtractMessageNotifications(readMessageIds.length)}
        })
    }

    useEffect(() => 
    {
        getMessages({type: activeTab},
                    (result) => replaceFeed(result)
        );
    }
    , [activeTab])

    useEffect(() => {
        if(feed.items && feed.items.length > 0 && activeTab == "inbox")
        {
            setMessagesToRead();
        }
    }, [activeTab, feed])

    return (
        <div>
            <div className="border-zinc-600 flex mb-4">
                <Button handleClick={() => setActiveTab("inbox")} className={`bg-zinc-600 mr-4 ${activeTab != "inbox" && "bg-zinc-800"}`}>Unread</Button>
                <Button handleClick={() => setActiveTab("all")} className={`bg-zinc-600 mr-4 ${activeTab != "all" && "bg-zinc-800"}`}>All Messages</Button>
                <Button handleClick={() => setActiveTab("sent")} className={`bg-zinc-600 mr-4 ${activeTab != "sent" && "bg-zinc-800"}`}>Sent Messages</Button>
            </div>

            <div>
                <div>Showing {feed.items && feed.items.length} messages</div>
                <div className="border-t-2 mb-8 border-dashed border-zinc-600 flex justify-between"></div>

                {feed.items &&
                    feed.items.map((item) => <Message data={item} key={item.id} appendReply={appendReply} />)
                }
            </div>

            
            {!feed.endOfItems && <Button handleClick=
            {
                () => getMessages(
                                    {type: activeTab, lastSeen: feed.items[feed.items.length - 1].most_recent_child_id},
                                    (result) => 
                                    {
                                        console.log("inbox", result)
                                        mergeFeed(result)
                                    }
                )
            }
            className="w-full"
            >
            SHOW MORE
            </Button>}

        </div>
    )
}