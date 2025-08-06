import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import { useState } from 'react';
import { postData } from "./utils/fetch"
import { useTitle } from './hooks/useTitle';

import CONFIG from "./config"

/*
    A simple form that asks the user to provide an account name in order to reset a password.
    This is designed to be used as part of a larger series of components that enable the
    password reset feature. See PasswordResetModal.js for more information

    onSubmit (func, optional): A callback that will be triggered upon successful submission.
        The callback will be called with the server's response as its argument.
*/
export default function UsernameInputForm({onSubmit})
{
    const [error, setError] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useTitle("Reset Password")

    /*
        Submits the form to the server. On success, calls onSubmit with the server's response
    */
    async function handleSubmit(event)
    {
        event.preventDefault();
        setError(undefined);
        setIsLoading(true);
        postData(
        {
            baseRoute: `${CONFIG.API_URL}/getPasswordResetCode`,
            body: {username: event.target.username.value},
            onSuccess: (results) => 
            {
                if(onSubmit)
                    onSubmit(results)
            },
            onFailure: (results) => 
            {
                setError(results.error);
            }
        })
        setIsLoading(false);
    }


    return (
        <>
        <img src="/logo-boxed-lightpurp.png" className='h-12 w-12 mb-2'></img>
        <div className="dark:text-darkText1 text-lightText1 text-2xl font-bold text-center mb-6">Reset Password</div>
        <form method="POST" className="flex flex-col items-center mb-6" id="loginForm" onSubmit={handleSubmit}>
            <TextInputSmallRound id="usernameLoginInput" name="username" placeholder="Username"
            className="mb-3 rounded-md"> </TextInputSmallRound>
            <Button type="submit" theme="primary" className={"h-7 w-16 px-4 mt-6"} disabled={isLoading}>Next</Button>
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </form>
        </>
    )
}
