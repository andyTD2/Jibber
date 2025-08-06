import { twMerge } from "tailwind-merge"
import { useRef, useState } from "react";
import { useStore } from "./Store";

import Button from "./Button"
import Overlay from "./Overlay";

/*
    This component provides an interface for users to view and upload image files. Typically
    used for profile or board edits.

    image (str, required): Src link for the current image(before upload, ie., user's current pfp). 

    onUpload (func, required): Callback that is triggered when the user initiates a new file upload.
        It is provided with the file, fizeSize in MB, and fileExtension(str).

    className (str, optional): Additional styling
*/

export default function ImageInput({image, className, onUpload})
{
    // We want to use our own custom button for file uploads, so we hide the input element.
    // When our custom button is clicked, we direct that clicks towards our hidden input element.
    // This requires a reference to the hidden input
    const hiddenFileInput = useRef(null);
    const [uploading, setUploading] = useState(false);

    const theme = useStore(state => state.theme)

    // Redirect a click on our custom button to the hidden input
    const handleClick = (event) => 
    {
        event.preventDefault();
        hiddenFileInput.current.click();
    };

    // When the user uploads a new file, this function is called
    const handleChange = (event) => 
    {
        const fileUploaded = event.target.files[0];
        if(fileUploaded)
        {
            const fileSize = fileUploaded.size;
            const fileExtension = fileUploaded.name.split('.').pop();
            setUploading(true);
            onUpload(fileUploaded, fileSize, fileExtension, () => setUploading(false));
        }
    };

    return (
        <div className={`${twMerge("flex flex-col w-[256px] h-[256px] relative", className)}`}>
            <div className="size-full self-center color-transition dark:bg-dark3 bg-light3 p-2 shadow-primary rounded-full">
                {uploading &&
                    <Overlay className={"absolute rounded-full bg-zinc-800/85 flex items-center justify-center"}>
                        <img className="size-1/3" src="/spinner-light.svg"></img>
                    </Overlay>
                }
                <img src={image} className="h-full w-full rounded-full border-dotted dark:border-white border-black border-2 object-cover"></img>
            </div>
            <input
                type="file"
                onChange={handleChange}
                ref={hiddenFileInput}
                className="hidden"
            />
            <Button className="absolute bottom-0 right-0 h-fit w-fit p-1 mt-2 shadow-lg text-sm rounded-full" handleClick={handleClick} theme="outlined">
                <img className="size-6" src={theme == "dark" ? "/upload-light.png" : "/upload-dark.png"}></img>
            </Button>
        </div>
    )
}