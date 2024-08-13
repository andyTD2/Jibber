import { useState } from "react";
import Button from "./Button";
import InputBox from "./InputBox"
import { useNavigate } from "react-router-dom";

import { useTipTapEditor } from "./hooks/useTipTapEditor"

import { postData } from "./utils/fetch";
import CONFIG from "./config.json"

export default function CreatePost({board, contentCharLimit}) 
{
    const editor = useTipTapEditor({charLimit: contentCharLimit});
    const navigate = useNavigate();

    // /{baseRoute, queryParams, body, onSuccess}
    //https://localhost:3000/r/${subreddit}/feed
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `https://localhost:3000/r/${board}/post/newPost`,
                    body: {...form, postContent: editor.getHTML()},
                    onSuccess: (data) => {navigate(`/r/${board}/post/${data.postId}`)},
                    onFailure: (data) => {setError(data.error)}
                })
    }

    const [error, setError] = useState();
    const [form, setForm] = useState({postTitle: "", postLink: "", useArticleTitle: false})
    console.log(form);
    
    if(!editor) return null;

    return (
        <div className="bg-zinc-950 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div className="text-2xl font-semibold">{`Create and publish to ${board}`}</div>
            <form className="w-full" onSubmit={handleSubmit}>

                <label htmlFor="postTitle">Post Title</label>
                <input 
                    className="text-2xl placeholder-zinc-500 w-full mb-4 h-16 rounded-lg box-border text-white pl-2 outline-none bg-zinc-800 focus:bg-zinc-700 hover:bg-zinc-600" 
                    type="text" 
                    name="postTitle" 
                    id="postTitle"
                    placeholder="Title"
                    value={form.postTitle}
                    maxLength={CONFIG.MAX_LENGTH_POST_TITLE}
                    onChange={(e) => setForm(prev => ({...prev, postTitle: e.target.value}))}
                />

                <label htmlFor="postLink">Post Link</label>
                <input 
                    className="text-2xl placeholder-zinc-500 w-full h-16 rounded-lg box-border text-white pl-2 outline-none bg-zinc-800 focus:bg-zinc-700 hover:bg-zinc-600" 
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

                <label htmlFor="postBody">Post Body</label>
                <InputBox editor={editor} className={"rounded-md min-h-[200px]"} id="postBody"></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2">
                        Submit
                    </Button>
                    <div>{editor.storage.characterCount.characters()} / {contentCharLimit}</div>
                </div>
                {error && <div className="text-red-600">{error}</div>}

            </form>
        </div>
    )
}