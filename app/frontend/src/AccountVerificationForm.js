import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import { useState } from 'react';
import { useTitle } from './hooks/useTitle';

import { getAuthStatus } from './utils/getUser';
import { postData } from "./utils/fetch"

import CONFIG from "./config"

/*
    Form that is designed to handle account verification. Users must input the correct
    verification code sent to their email. Users can also request the code be resent.

    username (str, required): Name of the account being verified
    onVerification (func, optional): Callback triggered upon successful verification
*/
export default function AccountVerificationForm({username, onVerification})
{
    const [error, setError] = useState(undefined);
    const [codeSent, setCodeSent] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useTitle("Verify Account");

    async function handleSubmit(event)
    {
        setIsLoading(true);
        setError(undefined);
        event.preventDefault();

        postData(
        {
            baseRoute: `${CONFIG.API_URL}/userVerification`,
            body: {username: username, verificationCode: event.target.verificationCode.value},
            onSuccess: () => {
                //This function will complete our login upon success
                getAuthStatus();

                setIsLoading(false);
                if(onVerification)
                    onVerification();
            },
            onFailure: (results) => {
                setIsLoading(false);
                setError(results.error);
            }
        })
    }

    async function requestNewVerificationCode()
    {
        postData(
            {
                baseRoute: `${CONFIG.API_URL}/getVerficationCode`,
                body: {username: username},
                onSuccess: (results) => 
                {
                    //Display the time when the code was resent
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
            <div className="dark:text-darkText1 text-lightText1 mb-3 text-center text-sm font-semibold">Please verify the account using the code sent to the associated email.</div>
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
