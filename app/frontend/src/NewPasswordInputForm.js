import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import { useState } from 'react';
import { postData } from "./utils/fetch"
import { validatePassword } from "./utils/textValidation";
import { useTitle } from './hooks/useTitle';

import CONFIG from "./config"

/*
    Provides an interface that allows the user to input a new password. Is used
    in by the PasswordResetModal component. User must verify that they are the owner
    of this account before being allows to input the new password. This is handled in a previous
    step (see PasswordResetModal.js for an overview of the steps).

    username (str, required): username of the current user

    verificationCode (str, required): verificationCode from the previous step. This must
        be sent to the server in order to verify that the user owns this account

    onSubmit (func, optional): Optional callback that is triggered on successful password reset. 
        It will be called with the server's response as its only argument.
*/
export default function NewPasswordInputForm({username, verificationCode, onSubmit, onRedirect})
{
    //showPassword states are used to hide/unhide the password

    const [serverError, setServerError] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const [passwordOne, setPasswordOne] = useState("");
    const [showPasswordOne, setShowPasswordOne] = useState(true);

    const [passwordTwo, setPasswordTwo] = useState("");
    const [showPasswordTwo, setShowPasswordTwo] = useState(true);

    const [passwordError, setPasswordError] = useState(undefined);

    const [success, setSuccess] = useState(false);

    useTitle("Reset Password")

    /*
        Flush our error state, disable submission (and set loading), then submit the form to the server. 
        Upon success, call the onSubmit callback, otherwise display the error to the user. 
    */
    async function handleSubmit(event)
    {
        event.preventDefault();
        setServerError(undefined);
        setIsLoading(true);
        postData(
        {
            baseRoute: `${CONFIG.API_URL}/passwordReset`,
            body: {username, verificationCode, newPassword: event.target.newPasswordOne.value},
            onSuccess: (results) => 
            {
                if(onSubmit)
                    onSubmit(results)

                setSuccess(true);
            },
            onFailure: (results) => 
            {
                setServerError(results.error);
            }
        })
        setIsLoading(false);
    }

    /*
        We need to ensure that the two passwords match, and that they both abide by
        our password constraints. If there is an issue, we set passwordError state
        which will render the error to the user.
    */
    const validatePasswords = (passwordOne, passwordTwo) => 
    {
        const passwordInput = validatePassword(passwordOne);

        if(!passwordInput.isValid)
            setPasswordError(passwordInput.error);
        else if(passwordOne != passwordTwo)
        {
            setPasswordError("Passwords do not match.");
        }
        else
            setPasswordError(undefined);
    }

    if(success)
    {
        setTimeout(() => {
            if(onRedirect)
                onRedirect();

            setSuccess(false);
        }, 5000)
    }

    return (
        <>
        <img src="/logo-boxed-lightpurp.png" className='h-12 w-12 mb-2'></img>
        <div className="dark:text-darkText1 text-lightText1 text-2xl font-bold text-center mb-6">Enter new password</div>
        <form method="POST" className="flex flex-col items-center mb-6" id="loginForm" onSubmit={handleSubmit}>

            <div className="flex items-center mt-3">
                <TextInputSmallRound 
                    type={showPasswordOne ? "password" : "text"} 
                    id="newPasswordOne" name="newPasswordOne" placeholder="  New Password"
                    className="pr-6 rounded-md"
                    value={passwordOne}
                    onChange={(e) => {setPasswordOne(e.target.value); validatePasswords(e.target.value, passwordTwo)}}>
                </TextInputSmallRound>

                <div className="flex justify-around items-center">
                    <img 
                        src={showPasswordOne ? "/hide-password-orange.png" : "/show-password-orange.png"}
                        onClick={() => setShowPasswordOne(!showPasswordOne)}
                        className='absolute w-4 h-4 mr-6'
                    />
                </div>
            </div>

            <div className="flex items-center mt-3">
                <TextInputSmallRound 
                    type={showPasswordTwo ? "password" : "text"} 
                    id="newPasswordTwo" name="newPasswordTwo" placeholder="  Reenter Password"
                    className="pr-6 rounded-md"
                    value={passwordTwo}
                    onChange={(e) => {setPasswordTwo(e.target.value); validatePasswords(passwordOne, e.target.value)}}>
                </TextInputSmallRound>

                <div className="flex justify-around items-center">
                    <img 
                        src={showPasswordTwo ? "/hide-password-orange.png" : "/show-password-orange.png"}
                        onClick={() => setShowPasswordTwo(!showPasswordTwo)}
                        className='absolute w-4 h-4 mr-6'
                    />
                </div>
            </div>

            {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
            {!success && <Button type="submit" theme="primary" className={"h-7 w-16 px-4 mt-6"} disabled={isLoading || passwordError} showSpinnerOnDisable={false}>Next</Button>}
            {success && <div className="text-green-700 text-xs mt-6 text-center">Password successfully reset! Please log back in to continue. <br></br>Redirecting in 5 seconds...</div>}
            <div className="text-red-500 text-xs mt-1 min-h-4">{serverError}</div>
        </form>
        </>
    )
}
