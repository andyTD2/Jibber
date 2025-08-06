import { useTipTapEditor } from "./hooks/useTipTapEditor";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTitle } from "./hooks/useTitle";

import { postData } from "./utils/fetch";
import CONFIG from "./config"

import InputBox from "./InputBox";
import Button from "./Button";
import ImageInput from "./ImageInput";
import { useStore } from "./Store";

/*
    This component provides an interface that allows users to edit profiles that they own.
    Uses a form to gather user input for textual edits. Image edits are handled with
    the ImageInput component and associated functions.

    profileData (obj, required): Profile data, which is required because we set the initial
        form values to the "old" data. Format is as follows:

        {
            bio: "This is my bio...",
            description: "This is my profile description",
            username: "myUser24"
            profilePicture: "https//myprofilepicture.mypfp"
        }
    
    user (str, required): The current user (NOT profile).

    setProfileData (func, required): A state setter provided by the parent. Allows us to modify
        the profile after submitting changes (such as user PFP, description, bio)
*/
export default function ProfileEditor({profileData, user, setProfileData, onLoad})
{
    const navigate = useNavigate();
    const [error, setError] = useState();

    const setProfilePicture = useStore(state => state.setProfilePicture);

    useTitle("Edit Your Profile")

    // Setting up TipTap rich text editors
    const descriptionEditor = useTipTapEditor({
                                    charLimit: CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION, 
                                    initialContent: profileData && profileData.description, 
                                });

    const sidebarEditor = useTipTapEditor({
                                    charLimit: CONFIG.MAX_LENGTH_PROFILE_BIO,
                                    initialContent: profileData && profileData.bio,
                                });

    /*
        Submit profile edits to the server. On success, modify/rerender the profile data,
        then redirect away from the form back to the profile's default view.
    */
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        postData({
                    baseRoute: `${CONFIG.API_URL}/u/${profileData.username}/edit`,
                    body: {description: descriptionEditor.getText(), bio: sidebarEditor.getHTML()},
                    onSuccess: (results) => 
                    {
                        setProfileData(prev => ({...prev, ...results}))
                        navigate(`/u/${profileData.username}`);
                    },
                    onFailure: (result) => {setError(result.error)}
        })
    }

    /*
        Upload image workflow. First grabs a presigned url from the server, then uses
        that presigned url to upload a file to the server.

        file (file, required): file being uploaded
        fileSize (int, required): File size in bytes. 10,000,000 (10MB) is the max size
        fileExtension (str, required): File extensions. Supports png and jpg for now.
    */
    const handlePfPUpload = (file, fileSize, fileExtension, onCompletion) =>
    {
        //Get presigned url
        postData({
            baseRoute: `${CONFIG.API_URL}/uploadProfilePic`,
            body: {fileSize, fileExtension},
            onSuccess: (result) => {
                uploadImage(result.data.presignedURL, file, fileExtension, onCompletion);
            },
            onFailure: (result) => {
                onCompletion()
            }
        })
    }

    /*
        Upload image to a given url. On success, changes the pfp to the new one.

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
                baseRoute: `${CONFIG.API_URL}/confirmProfilePicUpload`,
                body: {fileExtension},
                onSuccess: (results) =>
                {
                    setProfileData(prev => ({...prev, profilePicture: results.url}))
                    setProfilePicture(results.url);
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

    if(!descriptionEditor || !sidebarEditor || !profileData || user != profileData.username) return null;

    return (
        <div className="lg:px-3 md:rounded-none color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 w-full h-min p-4 flex flex-col items-center mt-10 rounded-md">
            <div>Edit Profile</div>
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>

                <ImageInput image={profileData.profilePicture} onUpload={handlePfPUpload} className="my-4 self-center"></ImageInput>

                <label htmlFor="profileDescription" className="font-semibold">Profile Description</label>
                <InputBox editor={descriptionEditor} className={"rounded-md min-h-[100px]"} id="profileDescription" showTools={false}></InputBox>
                <div className="ml-auto">{descriptionEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION}</div>


                <label htmlFor="profileBio" className="font-semibold">Bio</label>
                <InputBox id="profileBio" editor={sidebarEditor} className={"rounded-md min-h-[200px]"} toolsClassName={"rounded-t-md"} editorClassName={"rounded-t-none"}></InputBox>

                <div className="flex justify-between">               
                    <Button className="h-min mt-2" theme="primary">
                        Submit
                    </Button>
                    <div>{sidebarEditor.storage.characterCount.characters()} / {CONFIG.MAX_LENGTH_PROFILE_BIO}</div>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
        </div>
    )
}