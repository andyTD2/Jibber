import { useTipTapEditor } from "./hooks/useTipTapEditor";
import { useState } from "react";
import InputBox from "./InputBox";
import Button from "./Button";
import ImageInput from "./ImageInput";
import { postData } from "./utils/fetch";
import { useNavigate } from "react-router-dom";
import CONFIG from "./config.json"

export default function ProfileEditor({profileData, user, setProfileData})
{
    console.log("profileData", profileData);
    const navigate = useNavigate();
    const [error, setError] = useState();

    const descriptionEditor = useTipTapEditor({charLimit: CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION, initialContent: profileData && profileData.description});

    const sidebarEditor = useTipTapEditor({
                                    charLimit: CONFIG.MAX_LENGTH_PROFILE_BIO,
                                    initialContent: profileData && profileData.bio
                                });

    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `https://localhost:3000/u/${profileData.userName}/edit`,
                    body: {description: descriptionEditor.getHTML().slice(3).slice(0, -4), bio: sidebarEditor.getHTML()},
                    onSuccess: (results) => 
                    {
                        setProfileData(prev => ({...prev, ...results}))
                        navigate(`/u/${profileData.userName}`);
                    },
                    onFailure: (result) => {setError(result.error)}
        })
    }

    const handlePfPUpload = (file, fileSize, fileExtension) =>
    {
        //Get presigned url
        postData({
            baseRoute: "https://localhost:3000/uploadProfilePic",
            body: {fileSize, fileExtension},
            onSuccess: (result) => {
                console.log(result);
                uploadImage(result.data.presignedURL, file, fileExtension);
            }
        })
    }

    const uploadImage = async (url, file, fileExtension) =>
    {
        const response = await fetch(url, {
            method: "PUT",
            body: file
        });

        if(response.ok)
        {
            postData({
                baseRoute: "https://localhost:3000/confirmProfilePicUpload",
                body: {fileExtension},
                onSuccess: (results) =>
                {
                    console.log("Upload successful!", results);
                    setProfileData(prev => ({...prev, profilePic: results.url}))
                }
            })
        }
    }

    if(!descriptionEditor || !sidebarEditor || !profileData || user != profileData.userName) return <div className="w-full"></div>;

    return (
        <div className="bg-zinc-950 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div>Edit Profile</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

                <ImageInput image={profileData.profilePic} onUpload={handlePfPUpload} className="my-4"></ImageInput>

                <label htmlFor="profileDescription">Profile Description</label>
                <InputBox editor={descriptionEditor} className={"rounded-md min-h-[100px]"} id="profileDescription" showTools={false}></InputBox>
                <div className="ml-auto">{descriptionEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION}</div>


                <label htmlFor="profileBio">Bio</label>
                <InputBox id="profileBio" editor={sidebarEditor} className={"rounded-md min-h-[200px]"}></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2">
                        Submit
                    </Button>
                    <div>{sidebarEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_PROFILE_BIO}</div>
                </div>
                {error && <div className="text-red-600">{error}</div>}
            </form>
        </div>
    )
}