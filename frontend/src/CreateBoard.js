import CONFIG from "./config.json"

import { useTipTapEditor } from "./hooks/useTipTapEditor";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { postData } from "./utils/fetch";

import InputBox from "./InputBox";
import Button from "./Button";

export default function CreateBoard()
{
    const sidebarEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_SIDEBAR});
    const descriptionEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_DESCRIPTION, extensions: []});
    const navigate = useNavigate();

    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `https://localhost:3000/createBoard`,
                    body: {boardName: boardName, boardSidebar: sidebarEditor.getHTML(), boardDescription: descriptionEditor.getHTML().slice(3).slice(0, -4)},
                    onSuccess: (results) => {navigate(`/r/${results.boardName}`)},
                    onFailure: (result) => {setError(result.error)}
                })
    }

    const [error, setError] = useState();
    const [boardName, setBoardName] = useState("")
    
    if(!sidebarEditor || !descriptionEditor) return null;

    return (
        <div className="bg-zinc-950 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div className="text-2xl font-semibold">{`Create board`}</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

                <label htmlFor="boardName">Board Name</label>
                <input 
                    className="text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border text-white pl-2 outline-none bg-zinc-800 focus:bg-zinc-700 hover:bg-zinc-600" 
                    type="text" 
                    name="boardName" 
                    id="boardName"
                    value={boardName}
                    maxLength={CONFIG.MAX_LENGTH_BOARD_NAME}
                    onChange={(e) => setBoardName(e.target.value)}
                />

                <label htmlFor="boardDescription">Board Description</label>
                <InputBox editor={descriptionEditor} className={"rounded-md min-h-[100px]"} id="boardDescription" showTools={false}></InputBox>
                <div className="ml-auto">{descriptionEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_BOARD_DESCRIPTION}</div>
                
                <label htmlFor="boardSidebar">Board Sidebar</label>
                <InputBox editor={sidebarEditor} className={"rounded-md min-h-[200px]"} id="boardSidebar"></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2">
                        Submit
                    </Button>
                    <div>{sidebarEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_BOARD_SIDEBAR}</div>
                </div>
                {error && <div className="text-red-600">{error}</div>}

            </form>
        </div>
    )
}