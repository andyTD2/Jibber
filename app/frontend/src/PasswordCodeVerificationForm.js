import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import CONFIG from "./config"

import { postData } from "./utils/fetch"
import { useState } from 'react';
import { useTitle } from './hooks/useTitle';

/*
    This component handles account verification. This step must take place before the user
    is allowed to reset their password. Users can also request a new verification code from this
    component. This is typically used as part of a password reset sequence inside the PasswordResetModal.

    username (str, required): Name of the current user's account

    onVerification (func, optional): A callback that is triggered upon successful server response.
        This callback is called with the server response as its argument.
*/
export default function PasswordCodeVerificationForm({username, onVerification})
{
    const [error, setError] = useState(undefined);
    const [codeSent, setCodeSent] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useTitle("Reset Password")

    /*
        Submit the verification code to the server. If successful, call the onVerification callback
        with the server's response. Otherwise, show the error.
    */
    async function handleSubmit(event)
    {
        //Set loading to prevent multiple presses of the button
        setIsLoading(true);
        //Flush errors
        setError(undefined);
        event.preventDefault();

        postData(
        {
            baseRoute: `${CONFIG.API_URL}/passwordResetCodeVerification`,
            body: {username: username, verificationCode: event.target.verificationCode.value},
            onSuccess: (results) => {
                if(onVerification)
                    onVerification(results);
            },
            onFailure: (results) => {
                setError(results.error);
            }
        })
        setIsLoading(false);
    }

    /*
        Users can request a new verification code. This function asks the server to supply
        a new code to the user's email. On success, display the time that the code was resent.
    */
    async function requestNewVerificationCode()
    {
        setCodeSent(undefined);
        postData(
            {
                baseRoute: `${CONFIG.API_URL}/getPasswordResetCode`,
                body: {username: username},
                onSuccess: (results) => 
                {
                    const timeSent = new Date(results.timeSent).toLocaleTimeString();
                    setCodeSent(`Resent: ${timeSent}`)
                },
                onFailure: (results) => {setError(`Error: ${results.error}`)}
            }
        )
    }

    if(!username) return null;

    return (
        <>
            <div className="dark:text-darkText1 text-lightText1 mb-3 text-center text-sm font-semibold">Please enter the code sent to your email associated with this account.</div>
            <div className="dark:text-darkText1 text-lightText1 hover:cursor-pointer underline text-xs active:no-underline" onClick={requestNewVerificationCode}>Resend code</div>
            {codeSent && <div className='text-xs text-green-500 text-center'>{codeSent}</div>}
            <form method="POST" className="flex flex-col items-center mb-6 mt-6" id="loginForm" onSubmit={handleSubmit}>
                <TextInputSmallRound id="verificationCode" name="verificationCode" maxLength={6}
                className="mb-3 w-44 h-12 text-2xl font-bold rounded-md"> </TextInputSmallRound>

                <Button type="submit" theme="primary" className={"h-7 w-16 px-4"} disabled={isLoading}>Next</Button>
                {error && <div className='mt-2 text-xs text-red-500 text-center'>{error}</div>}
            </form>
        </>
    )
}
