import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import { useStore } from './Store';
import { useState } from 'react';
import { getAuthStatus } from './utils/getUser';
import { postData } from "./utils/fetch"
import { useTitle } from './hooks/useTitle';

import CONFIG from "./config"

/*
    This component provides a form that allows users to login. Should be used in conjunction
    with a modal.

    onLogin (func, required): A callback function that is triggered when the user
        successfully logs in. It is provided with user data returned by the server.
*/

export default function LoginForm({onLogin})
{
    // This component should be used in conjunction with a modal.
    // We import these visibility state setters so that we can swap between modals
    // For example, if user forgets password, the login form provides an option to navigate
    // to the "forgot password" modal, which requires us to change the visibility of these modals
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    const setSignupModalVisibility = useStore((state) => state.setSignupModalIsOpen);
    const setPasswordResetModalIsOpen = useStore((state) => state.setPasswordResetModalIsOpen);

    const [showPassword, setShowPassword] = useState(true);
    const [error, setError] = useState(" ");
    const [isLoading, setIsLoading] = useState(false);

    useTitle("Sign In");

    /*
        When the user submits the login form, sent the data to our server.
        On success, check if the account is verified. If so, complete the login and
        handoff to the onLogin callback. Otherwise, go straight to onLogin callback.
    */
    async function handleSubmit(event)
    {
        event.preventDefault();
        setIsLoading(true);
        setError("");
        await postData(
        {
            baseRoute: `${CONFIG.API_URL}/userLogin`,
            body: {username: event.target.username.value, password: event.target.password.value},
            onSuccess: (user) => 
            {
                if(!user.requiresVerification)
                    getAuthStatus();

                if(onLogin)
                    onLogin(user);
                
            },
            onFailure: (results) => 
            {
                setError(results.error)
            }
        })
        setIsLoading(false);
    }

    return (
        <>
        <img src="/logo-boxed-lightpurp.png" className='h-12 w-12 mb-2'></img>
        <div className="dark:text-darkText1 text-lightText1 text-2xl font-bold text-center mb-6">SIGN IN</div>

        <form method="POST" className="dark:text-darkText1 text-lightText1 flex flex-col items-center mb-6" id="loginForm" onSubmit={handleSubmit}>
            <TextInputSmallRound id="usernameLoginInput" name="username" placeholder="Username" 
            className="mb-3 rounded-md"> </TextInputSmallRound>

            <div className="flex items-center mb-6">
                <TextInputSmallRound id="passwordLoginInput" name="password" placeholder="Password"
                className="pr-6 rounded-md" type={showPassword ? "password" : "text"}></TextInputSmallRound>
                <div className='flex justify-around items-center'>
                    <img src={showPassword ? "/hide-password-orange.png" : "/show-password-orange.png"} onClick={() => setShowPassword(!showPassword)} 
                    className='w-4 h-4 absolute mr-6'></img>
                </div>
            </div>

            <Button type="submit" className={"h-7 w-20 px-4 mt-6"} theme={"primary"} disabled={isLoading}>Submit</Button>
            <div className="text-xs underline hover:cursor-pointer" onClick={() => {setLoginModalVisibility(false); setSignupModalVisibility(true)}}>Sign Up</div>
            <div className="text-xs underline hover:cursor-pointer" onClick={() => {setLoginModalVisibility(false); setPasswordResetModalIsOpen(true)}}>Forgot Password?</div>
            <div className="text-red-500 text-xs mt-1 min-h-4">{error}</div>
        </form>
        </>
    )
}
