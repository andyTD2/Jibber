import { Link } from "react-router-dom";

export default function AccountCreationMessage({username, onClose})
{
    return (
        <div>
            <div className='text-sm'>
                <h3>Welcome to [placeholder]!</h3>
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