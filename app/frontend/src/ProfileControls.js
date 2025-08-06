import { Link } from "react-router-dom"
import Button from "./Button"
import { twMerge } from "tailwind-merge"

/*
    Renders profile controls for profile owners. For now, the only action
    supported is the edit profile button.

    profile (str, required): Name of the current profile
*/
export default function ProfileControls({profile, className, btnClassName})
{
    return (
        <div className={twMerge("h-min color-transition dark:bg-dark1 bg-light1 mb-8 p-3 rounded-md", className)}>
            <Link to={`/u/${profile}/edit`}><Button className={twMerge("w-full", btnClassName)} theme="outlined">Edit Profile</Button></Link>
        </div>
    )
}