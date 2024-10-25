import TextInputSmallRound from './TextInputSmallRound';
import Button from './Button';

import { useStore } from './Store';
import { useState } from 'react';
import { getAuthStatus } from './utils/getUser';
import { postData } from "./utils/fetch"


export default function LoginForm({onLogin})
{
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    const setSignupModalVisibility = useStore((state) => state.setSignupModalIsOpen);

    const [showPassword, setShowPassword] = useState(true);

    async function handleSubmit(event)
    {
        event.preventDefault();
        postData(
        {
            baseRoute: "https://localhost:3000/userLogin",
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
                console.log(results.error);
            }
        })
    }

    return (
        <>
        <div className="text-white text-3xl font-bold text-center mb-6">SIGN IN</div>
        <form method="POST" className="flex flex-col items-center mb-6" id="loginForm" onSubmit={handleSubmit}>
            <TextInputSmallRound id="usernameLoginInput" name="username" placeholder="Username" theme="dark" 
            className="mb-3 rounded-md"> </TextInputSmallRound>
            <div className="flex items-center mb-6">
                <TextInputSmallRound id="passwordLoginInput" name="password" placeholder="Password" theme="dark"
                className="pr-6 rounded-md" type={showPassword ? "password" : "text"}></TextInputSmallRound>
                <div className='flex justify-around items-center'>
                    <img src={showPassword ? "/hide-password.png" : "/show-password.png"} onClick={() => setShowPassword(!showPassword)} 
                    className='w-4 h-4 absolute mr-6'></img>
                </div>
            </div>
            <Button type="submit" className={"h-7 px-4"}>Submit</Button>
            <div className="text-xs underline hover:cursor-pointer" onClick={() => {setLoginModalVisibility(false); setSignupModalVisibility(true)}}>Sign Up</div>
        </form>
        </>
    )
}
