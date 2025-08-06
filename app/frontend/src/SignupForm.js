import { useState } from "react";
import { useTitle } from "./hooks/useTitle";

import { postData } from "./utils/fetch";
import { validateEmail, validatePassword, validateUsername } from "./utils/textValidation";

import TextInputSmallRound from "./TextInputSmallRound";
import Button from "./Button";

import CONFIG from "./config"

/*
    SignupForm component provides a form and validation for email, username, and password
    inputs. On successful submission, calls the onSignup callback with the new user's username

    onSignup (func, required): Callback that will be triggered if the user suceeds at creating
        a new account. Will be called with the account's username as its only argument.
*/
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

    useTitle("Create Account")

    /*
        Disable the submit button, then submit the form data to the server.
        On success, call the onSignup callback with the new user's username
    */
    const handleSubmit = (event) =>
    {
        setIsLoading(true);
        event.preventDefault();
        setServerError(undefined);

        postData(
        {
            baseRoute: `${CONFIG.API_URL}/userSignup`,
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

    /*
        When the email input changes, we need to validate that the input follows the correct email format.
        Further validation occurs on the server, this is just an initial step for obvious errors. Incorrect
        formats will show a user error (setEmailError)
    */
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

    /*
        When the user input changes, we need to validate it according to our username constraints.
        Incorrect formats will show an error (setUsernameError)
    */
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

    /*
        When the password input changes, we need to validate it according to our password constraints.
        Incorrect formats will show an error (serPasswordError)
    */
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
        <img src="/logo-boxed-lightpurp.png" className='h-12 w-12 mb-2'></img>
        <div className="dark:text-darkText1 text-lightText1 text-2xl font-bold text-center mb-6">SIGN UP</div>
        <form onSubmit={handleSubmit} method="POST" className="w-56 flex flex-col items-center" id="signupForm">

            <TextInputSmallRound id="emailSignupInput" name="email" placeholder="Email" 
            className="rounded-md" value={email} onChange={handleEmailChange}> </TextInputSmallRound>
            {emailError && <div className="text-red-500 text-xs text-center">{emailError}</div>}

            <TextInputSmallRound id="usernameSignupInput" name="username" placeholder="Username" 
            className="mt-3 rounded-md" value={username} onChange={handleUsernameChange} maxLength={30}> </TextInputSmallRound>
            {usernameError && <div className="text-red-500 text-xs text-center">{usernameError}</div>}

            <div className="flex items-center mt-3">
                <TextInputSmallRound 
                    type={showPassword ? "password" : "text"} 
                    id="passwordSignupInput" name="password" placeholder="  Password"
                    className="pr-6 rounded-md"
                    value={password}
                    onChange={handlePasswordChange}>
                </TextInputSmallRound>

                <div className="flex justify-around items-center">
                    <img 
                        src={showPassword ? "/hide-password-orange.png" : "/show-password-orange.png"}
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute w-4 h-4 mr-6'
                    />
                </div>
            </div>
            {passwordError && <div className="text-red-500 text-xs text-center">{passwordError}</div>}
            
            <Button type="submit" theme="primary" className={"h-7 w-16 px-4 mt-6"} disabled={isLoading || emailError || usernameError || passwordError} showSpinnerOnDisable={false}>Next</Button>
            {serverError && <div className="text-red-500 text-xs mt-1">{serverError}</div>}
        </form>
        </>
    )
}