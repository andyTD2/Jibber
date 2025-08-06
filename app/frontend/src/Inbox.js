import Button from "./Button";
import Message from "./Message";

import { useEffect } from "react";
import { useStore } from "./Store";
import { useFeed } from "./hooks/feed";
import { useState } from "react";
import { useTitle } from "./hooks/useTitle";

import { getData, postData } from "./utils/fetch";

import CONFIG from "./config"
import ShowMore from "./ShowMore";

/*
    The inbox component allows users to view and reply to existing messages. Messages
    are categorized as unread, sent, or all. Note, composing new messages are handled
    by a different component.
*/

export default function Inbox()
{
    const [activeTab, setActiveTab] = useState("inbox");
    const {feed, modifyFeedItem, mergeFeed, replaceFeed} = useFeed();
    const user = useStore((state) => state.user);
    const subtractMessageNotifications = useStore(state => state.subtractMessageNotifications);

    useTitle("Inbox");

    /*
        When the user writes a new reply, this function will append the reply
        to the message thread.

        id (str, required): the id of the original message (top of the message thread)
        reply (obj, required): an object representing the new reply to append to the thread.
            See Message component for more details
    */
    const appendReply = (id, newReply) =>
    {
        const replyList = feed.itemMap.get(id).replies;
        modifyFeedItem(id, {replies: [...replyList, newReply]})
    }

    /*
        Retrieve inbox messages from server.

        queryParams (obj, optional): Any query params that should be passed to the server.
        onSuccess (func, required): A callback function that will be triggered on successful retrieval
    */
    const getMessages = (queryParams, onSuccess) =>
    {
        getData({
            baseRoute: `${CONFIG.API_URL}/inbox`,
            queryParams,
            onSuccess
        })
    }

    /*
        Sets all unread messages to read clientside, then sends a POST request to the server
        informing it that the user has read these messages. On success, it updates the 
        notifications number to subtract unread message notifications.
    */
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
            baseRoute: `${CONFIG.API_URL}/setMessageStatus`,
            body: {messageIds: readMessageIds, newStatus: "read"},
            onSuccess: () => {subtractMessageNotifications(readMessageIds.length)}
        })
    }

    /*
        When the active tab changes (unread, sent, all messages), we retrieve
        the correct messages from the server and display them.
    */
    useEffect(() => 
    {
        getMessages({type: activeTab},
                    (result) => replaceFeed(result)
        );
    }
    , [activeTab])

    /*
        This useEffect hook sets all messages to read when the user views the unread messages tab.
    */
    useEffect(() => {
        if(feed.items && feed.items.length > 0 && activeTab == "inbox")
        {
            setMessagesToRead();
        }
    }, [activeTab, feed])

    return (
        <div className="color-transition dark:text-darkText1 text-lightText1 sm:text-sm">
            <div className="border-zinc-600 flex mb-4 gap-x-4">
                <Button handleClick={() => setActiveTab("inbox")} className={`sm:px-4 dark:bg-dark5 bg-light4 ${activeTab != "inbox" && "dark:bg-dark3 bg-light1"}`}>Unread</Button>
                <Button handleClick={() => setActiveTab("all")} className={`sm:px-4 dark:bg-dark5 bg-light4 ${activeTab != "all" && "dark:bg-dark3 bg-light1"}`}>All Messages</Button>
                <Button handleClick={() => setActiveTab("sent")} className={`sm:px-4 dark:bg-dark5 bg-light4 ${activeTab != "sent" && "dark:bg-dark3 bg-light1"}`}>Sent</Button>
            </div>

            <div>
                <div>Showing {feed.items && feed.items.length} messages</div>
                <div className="border-t-2 mb-8 lg:mb-2 border-dashed border-zinc-600 flex justify-between"></div>

                {feed.items &&
                    feed.items.map((item) => <Message data={item} key={item.id} className={"lg:mb-2"} appendReply={appendReply} />)
                }
            </div>
            
            {feed.items && !feed.endOfItems && <ShowMore
                onShowMore=
                {                
                    () => getMessages(
                        {type: activeTab, lastSeen: feed.items[feed.items.length - 1].most_recent_child_id},
                        (result) => 
                        {
                            mergeFeed(result)
                        }
                    )
                }
            >
            </ShowMore>}

        </div>
    )
}