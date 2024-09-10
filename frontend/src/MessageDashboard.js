import { useState } from "react"
import { useTipTapEditor } from "./hooks/useTipTapEditor"

import { postData, getData } from "./utils/fetch"

import CONFIG from "./config.json"

import Button from "./Button"
import Inbox from "./Inbox"
import InputBox from "./InputBox"
import { useNavigate } from "react-router-dom"



export default function MessageDashboard()
{
    const [formData, setFormData] = useState({
        recipient: "",
        title: ""
    })
    const [activeTab, setActiveTab] = useState(0)
    const [error, setError] = useState(undefined);
    const editor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_MESSAGE_BODY})

    const handleChange = function(event)
    {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = function(e)
    {
        e.preventDefault();

        postData({
            baseRoute: "https://localhost:3000/sendMessage",
            body: {...formData, body: editor.getHTML()},
            onSuccess: () => {
                console.log("message sent!");
                setError(undefined);
                setFormData({recipient: "", title: ""});
                editor.commands.setContent("");
                setActiveTab(0);
            },
            onFailure: (result) => setError(result.error)
        })
    }

    return (
        <div className="px-12 w-full overflow-y-scroll scrollbar">

            <div className="border-zinc-600 flex pt-6 mb-4">
                <Button handleClick={() => setActiveTab(0)} className={`bg-zinc-600 mr-4 ${activeTab != 0 && "bg-zinc-800"}`}>Inbox</Button>
                <Button handleClick={() => setActiveTab(1)} className={`bg-zinc-600 mr-4 ${activeTab != 1 && "bg-zinc-800"}`}>Compose</Button>
            </div>

            {activeTab == 0 && <Inbox></Inbox>}

            {activeTab == 1 &&
            <form className="w-full flex flex-col max-w-[60%] bg-zinc-950 px-6 py-4 rounded-md" onSubmit={handleSubmit}>
                <div className="self-center text-2xl font-semibold">Create Message</div>

                <label htmlFor="recipient">Recipient</label>
                <input 
                    className="text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border text-white pl-2 outline-none bg-zinc-800 focus:bg-zinc-700 hover:bg-zinc-600" 
                    type="text" 
                    name="recipient" 
                    id="recipient"
                    maxLength={CONFIG.MAX_LENGTH_USER_NAME}
                    value={formData.recipient}
                    onChange={handleChange}
                />

                <label htmlFor="title">Title</label>
                <input 
                    className="text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border text-white pl-2 outline-none bg-zinc-800 focus:bg-zinc-700 hover:bg-zinc-600" 
                    type="text" 
                    name="title" 
                    id="title"
                    maxLength={CONFIG.MAX_LENGTH_MESSAGE_TITLE}
                    value={formData.title}
                    onChange={handleChange}
                />
                
                <label htmlFor="message">Message</label>
                <InputBox editor={editor} className={"rounded-md min-h-[200px]"} id="message"></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2">
                        Submit
                    </Button>
                    <div>{editor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_MESSAGE_BODY}</div>
                </div>
                {error && <div className="text-red-600">{error}</div>}

            </form>
            
            }




        </div>
    )
}

