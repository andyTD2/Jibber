import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTipTapEditor } from "./hooks/useTipTapEditor";
import { useTitle } from "./hooks/useTitle";

import InputBox from "./InputBox";
import Button from "./Button";
import ImageInput from "./ImageInput";

import CONFIG from "./config";
import { postData } from "./utils/fetch";

/*
    BoardEditor component provides an interface that allows moderators to modify 
    the board's description, avatar, or sidebar.

    moderator (bool, required): Must be truthy, otherwise the component will not render
    board (str, required): name of the board being edited
    setBoard (func, required): setter for board state. This callback will be triggered upon successful change
    boardData (obj, required): board data retrieved from server. Contains required information used to render the component
*/
export default function BoardEditor({moderator, board, setBoard, boardData, onLoad})
{
    //Text editors
    const sidebarEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_SIDEBAR, initialContent: boardData && boardData.sidebar});
    const descriptionEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_BOARD_DESCRIPTION, extensions: [], initialContent: boardData && boardData.description});

    const [error, setError] = useState();
    const navigate = useNavigate();

    useTitle("Edit Board")

    /*
        Submit the board edit form to the server.

        e (event, required): onSubmit event from form element
    */
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `${CONFIG.API_URL}/b/${board}/edit`,
                    body: {boardDescription: descriptionEditor.getText(), boardSidebar: sidebarEditor.getHTML()},
                    onSuccess: (result) => 
                    {
                        setBoard(prev => ({...prev, ...result}));
                        navigate(`/b/${board}`)
                    },
                    onFailure: (result) => {setError(result.error)}
                })
    }

    /*
        Retrieves a presigned url from the server that will temporarily authorize uploads using that url.
        Upon success, upload the board's avatar image.

        file (file, required): File of the image to upload
        fileSize (int, required): size of the file, in bytes. Cannot exceed 10,000,000(10MB)
        fileExtension (str, required): extension type of the file. For now, only jpg and png are supported.
    */
    const handlePfPUpload = (file, fileSize, fileExtension, onCompletion) =>
    {
        if(!file || !fileSize || !fileExtension) return;

        //Get presigned url
        postData({
            baseRoute: `${CONFIG.API_URL}/b/${board}/uploadBoardPic`,
            body: {fileSize, fileExtension},
            onSuccess: (result) => {
                uploadImage(result.data.presignedURL, file, fileExtension, onCompletion);
            },
            onFailure: (result) => {
                onCompletion();
            }
        })
    }

    /*
        Upload image to a given url. On success, changes the board's avatar to the new one.

        url (str, required): url to upload the image to
        file (file, required): File of the image to upload
        fileExtension (str, required): extension type of the file. For now, only jpg and png are supported.

    */
    const uploadImage = async (url, file, fileExtension, onCompletion) =>
    {
        if(!url || !file || !fileExtension) return

        const response = await fetch(url, {
            method: "PUT",
            body: file
        });

        if(response.ok)
        {
            await postData({
                baseRoute: `${CONFIG.API_URL}/b/${board}/confirmBoardPicUpload`,
                body: {fileExtension},
                onSuccess: (results) =>
                {
                    //update board's avatar
                    setBoard(prev => ({...prev, boardPicture: results.url}));
                }
            })
        }
        if(onCompletion) onCompletion();
    }

    //When component is done loading, call onLoad
    useEffect(() => {
        if (onLoad && typeof onLoad === 'function')
        {
            onLoad();
        }
    }, [])

    if(!descriptionEditor || !sidebarEditor || !boardData || !moderator || !board) return null;

    return (
        <div className="lg:px-3 md:rounded-none color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 shadow-md w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div className="text-2xl font-bold ">{`Edit board`}</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

            <ImageInput image={boardData.boardPicture} onUpload={handlePfPUpload} className="my-4 self-center"></ImageInput>

                <label htmlFor="boardDescription" className="font-semibold">Board Description</label>
                <InputBox editor={descriptionEditor} className={"rounded-md min-h-[100px]"} id="boardDescription" showTools={false}></InputBox>
                <div className="ml-auto">{descriptionEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_BOARD_DESCRIPTION}</div>
                
                <label htmlFor="boardSidebar" className="font-semibold">Board Sidebar</label>
                <InputBox editor={sidebarEditor} className={"rounded-md min-h-[200px]"} toolsClassName={"rounded-t-md"} editorClassName={"rounded-t-none"} id="boardSidebar"></InputBox>

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