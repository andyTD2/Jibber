import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTipTapEditor } from "./hooks/useTipTapEditor";


import InputBox from "./InputBox";
import Button from "./Button";

import CONFIG from "./config.json";
import { postData } from "./utils/fetch";

export default function BoardEditor({board, setBoard, boardData})
{
    const sidebarEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_SIDEBAR, initialContent: boardData && boardData.sidebar});
    const descriptionEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_DESCRIPTION, extensions: [], initialContent: boardData && boardData.description});
    const [error, setError] = useState();
    const navigate = useNavigate();

    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `https://localhost:3000/r/${board}/edit`,
                    body: {boardDescription: descriptionEditor.getHTML().slice(3).slice(0, -4), boardSidebar: sidebarEditor.getHTML()},
                    onSuccess: (result) => 
                    {
                        setBoard(prev => ({...prev, ...result}));
                        navigate(`/r/${board}`)
                    },
                    onFailure: (result) => {setError(result.error)}
                })
    }

    if(!sidebarEditor || !descriptionEditor) return null;

    return (
        <div className="bg-zinc-950 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div className="text-2xl font-semibold">{`Edit board`}</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

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