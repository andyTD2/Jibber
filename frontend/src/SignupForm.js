import { useState } from "react";
import { postData } from "./utils/fetch";
import { validateEmail, validatePassword, validateUsername } from "./utils/textValidation";

import TextInputSmallRound from "./TextInputSmallRound";
import Button from "./Button";

export default function SignupForm({onSignup})
{
    const [showPassword, setShowPassword] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(undefined)

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(undefined);

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(undefined);

    const [serverError, setServerError] = useState(undefined);

    const handleSubmit = (event) =>
    {
        setIsLoading(true);
        event.preventDefault();
        setServerError(undefined);

        postData(
        {
            baseRoute: "https://localhost:3000/userSignup",
            body: {email: event.target.email.value, username: event.target.username.value, password: event.target.password.value},
            onSuccess: (results) => 
            {
                setIsLoading(false);
                if(onSignup)
                    onSignup(results.username);
            },
            onFailure: (result) => 
            {
                setServerError(result.error);
                setIsLoading(false);
            }
        }
        )
    }

    const handleEmailChange = (e) =>
    {
        e.preventDefault();
        const emailInput = validateEmail(e.target.value);

        if(!emailInput.isValid) 
            setEmailError(emailInput.error);
        else 
            setEmailError(undefined);

        setEmail(e.target.value);
    }

    const handleUsernameChange = (e) =>
    {
        e.preventDefault();
        const usernameInput = validateUsername(e.target.value);

        if(!usernameInput.isValid) 
            setUsernameError(usernameInput.error);
        else 
            setUsernameError(undefined);

        setUsername(e.target.value);
    }

    const handlePasswordChange = (e) =>
    {
        const passwordInput = validatePassword(e.target.value);

        if(!passwordInput.isValid)
            setPasswordError(passwordInput.error);
        else
            setPasswordError(undefined);

        setPassword(e.target.value);
    }

    return (
        <>
        <div className="text-white text-3xl font-bold text-center mb-6">SIGN UP</div>
        <form onSubmit={handleSubmit} method="POST" className="w-56 flex flex-col items-center" id="signupForm">

            <TextInputSmallRound id="emailSignupInput" name="email" placeholder="Email" theme="dark" 
            className="rounded-md" value={email} onChange={handleEmailChange}> </TextInputSmallRound>
            {emailError && <div className="text-red-500 text-xs text-center">{emailError}</div>}

            <TextInputSmallRound id="usernameSignupInput" name="username" placeholder="Username" theme="dark" 
            className="mt-3 rounded-md" value={username} onChange={handleUsernameChange} maxLength={30}> </TextInputSmallRound>
            {usernameError && <div className="text-red-500 text-xs text-center">{usernameError}</div>}

            <div className="flex items-center mt-3">
                <TextInputSmallRound 
                    type={showPassword ? "password" : "text"} 
                    id="passwordSignupInput" name="password" placeholder="  Password" theme="dark"
                    className="pr-6 rounded-md"
                    value={password}
                    onChange={handlePasswordChange}>
                </TextInputSmallRound>

                <div className="flex justify-around items-center">
                    <img 
                        src={showPassword ? "/hide-password.png" : "/show-password.png"}
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute w-4 h-4 mr-6'
                    />
                </div>
            </div>
            {passwordError && <div className="text-red-500 text-xs text-center">{passwordError}</div>}
            
            <Button type="submit" className={"h-7 w-16 px-4 mt-6"} disabled={isLoading}>{isLoading ? <img className="h-6 w-6"src="/spinner-light.svg"></img> : "Next"}</Button>
            {serverError && <div className="text-red-500 text-xs mt-1">{serverError}</div>}
        </form>
        </>
    )
}