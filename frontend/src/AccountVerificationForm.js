import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';
import { getAuthStatus } from './utils/getUser';
import { postData } from "./utils/fetch"
import { useState } from 'react';

export default function AccountVerificationForm({username, onVerification})
{
    const [error, setError] = useState(undefined);
    const [codeSent, setCodeSent] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event)
    {
        setIsLoading(true);
        setError(undefined);
        event.preventDefault();

        postData(
        {
            baseRoute: "https://localhost:3000/userVerification",
            body: {username: username, verificationCode: event.target.verificationCode.value},
            onSuccess: () => {
                //log in
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
                baseRoute: "https://localhost:3000/newVerficationCode",
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
            <div className="text-white mb-3 text-center text-sm font-semibold">Please verify the account using the code sent to the associated email.</div>
            <div className="hover:cursor-pointer underline text-xs active:no-underline" onClick={requestNewVerificationCode}>Resend code</div>
            {codeSent && <div className='text-xs text-green-500 text-center'>{codeSent}</div>}
            <form method="POST" className="flex flex-col items-center mb-6 mt-6" id="loginForm" onSubmit={handleSubmit}>
                <TextInputSmallRound id="verificationCode" name="verificationCode" theme="dark" maxLength={6}
                className="mb-3 w-44 h-12 text-2xl font-bold rounded-md"> </TextInputSmallRound>

                <Button type="submit" className={"h-7 w-16 px-4"} disabled={isLoading}>{isLoading ? <img className="h-6 w-6"src="/spinner-light.svg"></img> : "Next"}</Button>
                {error && <div className='mt-2 text-xs text-red-500 text-center'>{error}</div>}
            </form>
        </>
    )
}
