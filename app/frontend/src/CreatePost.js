import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTipTapEditor } from "./hooks/useTipTapEditor"
import { useTitle } from "./hooks/useTitle";

import { postData } from "./utils/fetch";
import CONFIG from "./config"

import Button from "./Button";
import InputBox from "./InputBox"

/*
    Component provides a form for users to create a new post. Successful submission
    will redirect the user to the newly created post.

    board (str, required): Name of the board the post is being added to
    contentCharLimit (int, required): Max character limit of the post content
*/

export default function CreatePost({board, contentCharLimit, onLoad}) 
{
    useTitle("Create New Post")
    const editor = useTipTapEditor({charLimit: contentCharLimit});
    const navigate = useNavigate();

    //Submit form data to server. Navigate to newly created post on success.
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `${CONFIG.API_URL}/b/${board}/post/newPost`,
                    body: {...form, postContent: editor.getHTML()},
                    onSuccess: (data) => {navigate(`/b/${board}/post/${data.postId}`)},
                    onFailure: (data) => {setError(data.error)}
                })
    }

    const [error, setError] = useState();
    const [form, setForm] = useState({postTitle: "", postLink: "", useArticleTitle: false})

    //When component is done loading, call onLoad
    useEffect(() => {
        if (onLoad && typeof onLoad === 'function')
        {
            onLoad();
        }
    }, [])
    
    if(!editor) return null;

    return (
        <div className="lg:px-3 md:rounded-none color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md shadow-xl">
            <div className="text-2xl font-semibold">{`Create and publish to ${board}`}</div>
            <form className="w-full" onSubmit={handleSubmit}>

                <label htmlFor="postTitle" className="font-semibold">Post Title</label>
                <input 
                    className="shadow-lg text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border pl-2 outline-none dark:bg-dark3 bg-light2 dark:focus:bg-dark4 focus:bg-light3 dark:hover:bg-dark5 hover:bg-light4" 
                    type="text" 
                    name="postTitle" 
                    id="postTitle"
                    placeholder="Title"
                    value={form.postTitle}
                    maxLength={CONFIG.MAX_LENGTH_POST_TITLE}
                    onChange={(e) => setForm(prev => ({...prev, postTitle: e.target.value}))}
                />

                <label htmlFor="postLink" className="font-semibold">Post Link</label>
                <input 
                    className="shadow-lg text-2xl placeholder-zinc-500 w-full h-16 rounded-lg box-border pl-2 outline-none dark:bg-dark3 bg-light2 dark:focus:bg-dark4 focus:bg-light3 dark:hover:bg-dark5 hover:bg-light4" 
                    type="text" 
                    name="postLink" 
                    id="postLink"
                    placeholder="Link"
                    value={form.postLink}
                    maxLength={CONFIG.MAX_LENGTH_POST_LINK}
                    onChange={(e) => setForm(prev => ({...prev, postLink: e.target.value}))}
                />

                <div className="mb-4">
                    <input 
                        type="checkbox" 
                        id="useLink" 
                        name="useLink" 
                        checked={form.isChecked}
                        onChange={(e) => setForm(prev => ({...prev, useArticleTitle: e.target.checked}))}>
                        </input>
                    <label htmlFor="useLink" className="ml-1 text-zinc-400">prefer link as title</label>
                </div>

                <label htmlFor="postBody" className="font-semibold">Post Body</label>
                <InputBox editor={editor} className={"shadow-lg rounded-md min-h-[200px]"} toolsClassName={"rounded-t-md"} editorClassName={"rounded-t-none"} id="postBody"></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2" theme="primary">
                        Submit
                    </Button>
                    <div>{editor.storage.characterCount.characters()} / {contentCharLimit}</div>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}

            </form>
        </div>
    )
}