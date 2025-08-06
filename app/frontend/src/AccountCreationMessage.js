import { Link } from "react-router-dom";
import { useTitle } from "./hooks/useTitle";

/*
    This component displays the welcome message upon successful account creation.
    Used inside a multi step modal

    username (str, required): username of the account that was just created
    onClose (func, required): callback function that will be called on close (usually to close the modal)
*/
export default function AccountCreationMessage({username, onClose})
{
    useTitle("Welcome!");
    
    return (
        <div className="flex flex-col dark:text-darkText1 text-lightText1">
            <img src="/logo-boxed-lightpurp.png" className='h-12 w-12 mb-2 self-center'></img>
            <div className='text-sm'>
                <h3>Welcome to Jibber!</h3>
                <br></br>
                You've successfully signed up. Would you like to set up your profile now?
                <br></br>
                <br></br>
                <Link to={`/u/${username}/edit`} onClick={onClose} className='underline hover:cursor-pointer hover:no-underline'>Take me to my profile</Link>
                <br></br>
                <span onClick={onClose} className='underline hover:cursor-pointer hover:no-underline'>Skip for now</span>
                <br></br>
                <br></br>
                You can always update your profile later in your settings.
            </div>
        </div>
    )
}