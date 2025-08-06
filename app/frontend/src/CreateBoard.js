import CONFIG from "./config"

import { useTipTapEditor } from "./hooks/useTipTapEditor";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { postData } from "./utils/fetch";
import { useTitle } from "./hooks/useTitle";

import InputBox from "./InputBox";
import Button from "./Button";

/*
    This component provides a form for users to create a new board. Upon successful submission,
    it should automatically redirect to the newly created board.
*/

export default function CreateBoard()
{
    // Text editors...
    const sidebarEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_SIDEBAR});
    const descriptionEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_DESCRIPTION, extensions: []});
    const navigate = useNavigate();

    useTitle("Create Board")

    /*
        Submit the form to server. On success, navigate to the newly created board.
    */
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `${CONFIG.API_URL}/createBoard`,
                    body: {boardName: boardName, boardSidebar: sidebarEditor.getHTML(), boardDescription: descriptionEditor.getText()},
                    onSuccess: (results) => {navigate(`/b/${results.boardName}`)},
                    onFailure: (result) => {setError(result.error)}
                })
    }

    const [error, setError] = useState();
    const [boardName, setBoardName] = useState("")
    
    if(!sidebarEditor || !descriptionEditor) return null;

    return (
        <div className="color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md shadow-xl">
            <div className="text-2xl font-semibold">{`Create board`}</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

                <label htmlFor="boardName" className="font-semibold">Board Name</label>
                <input 
                    className="shadow-lg text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border dark:text-darkText1 text-lightText1 pl-2 outline-none dark:bg-dark3 bg-light2 dark:focus:bg-dark4 focus:bg-light3 dark:hover:bg-dark5 hover:bg-light4" 
                    type="text" 
                    name="boardName" 
                    id="boardName"
                    value={boardName}
                    maxLength={CONFIG.MAX_LENGTH_BOARD_NAME}
                    onChange={(e) => setBoardName(e.target.value)}
                />

                <label htmlFor="boardDescription" className="font-semibold">Board Description</label>
                <InputBox editor={descriptionEditor} className={"rounded-md min-h-[100px]"} id="boardDescription" showTools={false} editorClassName={"rounded-lg"}></InputBox>
                <div className="ml-auto">{descriptionEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_BOARD_DESCRIPTION}</div>
                
                <label htmlFor="boardSidebar" className="font-semibold">Board Sidebar</label>
                <InputBox editor={sidebarEditor} className={"rounded-md min-h-[200px]"} id="boardSidebar" editorClassName={"rounded-b-lg rounded-t-none "} ></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2" theme="primary">
                        Submit
                    </Button>
                    <div>{sidebarEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_BOARD_SIDEBAR}</div>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}

            </form>
        </div>
    )
}