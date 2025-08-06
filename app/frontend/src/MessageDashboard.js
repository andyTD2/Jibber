import { useState } from "react"
import { useTipTapEditor } from "./hooks/useTipTapEditor"
import { useStore } from "./Store"

import { postData } from "./utils/fetch"
import CONFIG from "./config"

import Button from "./Button"
import Inbox from "./Inbox"
import InputBox from "./InputBox"

/*
    This component manages Inbox and message creation. Users can switch between viewing their messages
    (inbox) and composing a new message. Message creation uses a controlled form.
*/
export default function MessageDashboard()
{
    const user = useStore((state) => state.user)

    const [formData, setFormData] = useState({
        recipient: "",
        title: ""
    })
    const [activeTab, setActiveTab] = useState(0)
    const [error, setError] = useState(undefined);
    const editor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_MESSAGE_BODY})

    /*
        Whenever a form input changes, parse the name and value from the input, and set the form data.
    */
    const handleChange = function(event)
    {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    /*
        Submit a new message to the server. On success, flush all fields and navigate to the inbox tab.
    */
    const handleSubmit = function(e)
    {
        e.preventDefault();

        postData({
            baseRoute: `${CONFIG.API_URL}/sendMessage`,
            body: {...formData, body: editor.getHTML()},
            onSuccess: () => {
                setError(undefined);
                setFormData({recipient: "", title: ""});
                editor.commands.setContent("");
                setActiveTab(0);
            },
            onFailure: (result) => setError(result.error)
        })
    }

    if(!user) return null;

    return (
        <div className="firefox:lg:pr-3 firefox:md:pr-2 px-12 w-full lg:px-3 lg:pr-1 md:px-2 md:pr-0 overflow-y-scroll dark:text-darkText1 text-lightText1">

            {/* Switch between tabs */}
            <div className="border-zinc-600 flex pt-6 mb-4">
                <Button handleClick={() => setActiveTab(0)} className={`dark:bg-dark5 bg-light4 mr-4 ${activeTab != 0 && "dark:bg-dark3 bg-light1"}`}>Inbox</Button>
                <Button handleClick={() => setActiveTab(1)} className={`dark:bg-dark5 bg-light4 mr-4 ${activeTab != 1 && "dark:bg-dark3 bg-light1"}`}>Compose</Button>
            </div>

            {activeTab == 0 && <Inbox></Inbox>}

            {activeTab == 1 &&
            // Controlled form
            <form className="lg:px-3 md:rounded-none shadow-md w-full flex flex-col max-w-[60%] lg:max-w-full color-transition dark:bg-dark1 bg-light1 px-6 py-4 rounded-md" onSubmit={handleSubmit}>
                <div className="self-center text-2xl font-semibold">Create Message</div>

                <label htmlFor="recipient">Recipient</label>
                <input 
                    className="shadow-md text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border pl-2 outline-none dark:bg-dark3 bg-light2 dark:focus:bg-dark4 focus:bg-light3 dark:hover:bg-dark5 hover:bg-light4" 
                    type="text" 
                    name="recipient" 
                    id="recipient"
                    maxLength={CONFIG.MAX_LENGTH_USER_NAME}
                    value={formData.recipient}
                    onChange={handleChange}
                />

                <label htmlFor="title">Title</label>
                <input 
                    className="shadow-md text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border pl-2 outline-none dark:bg-dark3 bg-light2 dark:focus:bg-dark4 focus:bg-light3 dark:hover:bg-dark5 hover:bg-light4" 
                    type="text" 
                    name="title" 
                    id="title"
                    maxLength={CONFIG.MAX_LENGTH_MESSAGE_TITLE}
                    value={formData.title}
                    onChange={handleChange}
                />
                
                <label htmlFor="message">Message</label>
                <InputBox editor={editor} className={"rounded-md min-h-[200px]"} toolsClassName={"rounded-t-md"} editorClassName={"rounded-t-none"} id="message"></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2">
                        Submit
                    </Button>
                    <div>{editor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_MESSAGE_BODY}</div>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}

            </form>
            
            }




        </div>
    )
}

