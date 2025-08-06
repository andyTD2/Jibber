import MessageReply from "./MessageReply";
import ReplyBox from "./ReplyBox";
import { Link } from "react-router-dom";
import { useState } from "react";
import { postData } from "./utils/fetch";
import { useStore } from "./Store";

import CONFIG from "./config"
import { twMerge } from "tailwind-merge";

/*
    This component represents a message thread. It renders all messages + replies, and allows
    the user to initiate their own reply.

    data (obj, required): message data obtained from the server

    appendReply (func, required): callback function that will be called to append new replies to 
        the message thread. Used to manage state (because each message thread will be in a feed 
        controlled by parent). This function will be called with the following args:

        appendReply(parentID, replyData)

            parentID (int, required): ID of the parent, or original message in the thread
            replyData (obj, required): An object that contains all the required data to render a reply

            replyData format is as follows:

            {
                body: <p>some content</p>,
                parentId: 13,
                minutesSinceCreation: 12,
                recipient_name: "i_am_recipient",
                sender_name: "im_the_author",
                status: "unread",
                id: 14
            }
*/

export default function Message({data, appendReply, className})
{
    const [replyBoxOpen, setReplyBoxOpen] = useState(false);
    const user = useStore((state) => state.user);

    /*
        Post reply data to server. On success, close the reply box, and append the new reply
        to the thread.

        editorContent (html, required): html content from tip tap editor
    */
    const submitReply = (editorContent, onSuccessfulSubmit, onSubmitFailure) =>
    {
        postData({
            baseRoute: `${CONFIG.API_URL}/sendMessage`,
            body: 
            {
                body: editorContent,
                parentId: data.id,
                recipient: user == data.recipient_name ? data.sender_name : data.recipient_name
            },
            onSuccess: (result) => 
            {
                setReplyBoxOpen(false);
                appendReply(data.id, 
                            {
                                body: editorContent,
                                parentId: data.id,
                                minutesSinceCreation: 0,
                                recipient_name: user == data.recipient_name ? data.sender_name : data.recipient_name,
                                sender_name: user,
                                status: "unread",
                                id: result.insertId
                            }
                )
                if(onSuccessfulSubmit)
                {
                    onSuccessfulSubmit();
                }
            },
            onFailure: (result) =>
            {
                if(onSubmitFailure)
                    onSubmitFailure(result);
            }
        })
    }

    // Figure out who is the sender, and who is the recipient.
    let correspondent; 
    if(data.sender_name == user)
    {
        correspondent = 
            <div className="flex">
                <img className='placeholder-avatar rounded-full w-4 h-4 mr-1' src={data.recipientProfilePic}></img>
                <Link to={`/u/${data.recipient_name}`} className="hover:underline text-xs align-middle dark:text-darkText2 text-lightText2">{data.recipient_name}</Link>
            </div>
    }
    else
    {
        correspondent = 
            <div className="flex">
                <img className='placeholder-avatar rounded-full w-4 h-4 mr-1' src={data.senderProfilePic}></img>
                <Link to={`/u/${data.sender_name}`} className="hover:underline text-xs align-middle dark:text-darkText2 text-lightText2">{data.sender_name}</Link>
            </div>
    }

    return (
        <div className={twMerge("content-item color-transition dark:text-darkText1 text-lightText1 dark:bg-dark1 bg-light1 shadow-md mb-8 min-h-24 flex flex-row pr-2 rounded-md", className)}>  
            <div className="flex flex-col px-4 py-2 mr-auto w-full min-w-0">

                
                {correspondent}
                <div className="text-xl font-semibold break-words">{data.title}</div>

                {/* Map all the replies for this message thread. */}
                <div className="border-l-[1px] border-dashed border-zinc-500 pl-2">
                    <MessageReply data={data}></MessageReply>
                    {data.replies.map(reply => 
                        <MessageReply data={reply} key={reply.id}></MessageReply>
                    )}
                </div>

                {/*Open the reply box */}
                <div onClick={() => setReplyBoxOpen(prev => !prev)} className="dark:text-darkText2 text-lightText2 hover:underline hover:cursor-pointer w-min">reply</div>

                {replyBoxOpen && <ReplyBox className="mt-4" charLimit={CONFIG.MAX_LENGTH_MESSAGE_BODY}
                    onSubmit={submitReply}
                />}

            </div>
        </div>
    );
}
