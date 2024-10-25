import { twMerge } from "tailwind-merge"
import { useRef } from "react";
import Button from "./Button"

export default function ImageInput({image, className, onUpload})
{
    const hiddenFileInput = useRef(null);

    const handleClick = (event) => 
    {
        event.preventDefault();
        hiddenFileInput.current.click();
    };

    const handleChange = (event) => 
    {
        const fileUploaded = event.target.files[0];
        if(fileUploaded)
        {
            const fileSize = fileUploaded.size;
            const fileExtension = fileUploaded.name.split('.').pop();
            console.log("fileUploaded", fileUploaded, "fileSize", fileSize, "fileExtension", fileExtension);
            onUpload(fileUploaded, fileSize, fileExtension);
        }
    };

    return (
        <div className={`${twMerge("flex flex-col w-32", className)}`}>
            <div className="h-32 w-32 bg-zinc-800 p-2 mr-2">
                <img src={image} className="h-full w-full rounded-full border-dotted border-white border-2 object-cover"></img>
            </div>
            <input
                type="file"
                onChange={handleChange}
                ref={hiddenFileInput}
                className="hidden"
            />
            <Button className="h-min mt-2" handleClick={handleClick}>
                Upload File
            </Button>
        </div>
    )
}