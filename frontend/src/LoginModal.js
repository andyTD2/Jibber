import Modal from './Modal';
import TextInputSmallRound from './TextInputSmallRound';
import { useStore } from './Store';
import ButtonSmallRound from './ButtonSmallRound';
import { useEffect } from 'react';
import { getAuthStatus } from './utils/getUser';

export default function LoginModal()
{
    const modalIsOpen = useStore((state) => state.loginModalIsOpen);
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    const setSignupModalVisibility = useStore((state) => state.setSignupModalIsOpen);

    async function fetchLogin(event)
    {
        event.preventDefault();

        const response = await fetch("https://localhost:3000/userLogin", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({username: event.target.username.value, password: event.target.password.value})
        });
        if (response.ok)
        {
            getAuthStatus();
            setLoginModalVisibility(false);
        }
    }


    return (
        <Modal onClose={() => setLoginModalVisibility(false)} modalIsOpen={modalIsOpen}>
            <div className="text-white text-3xl font-bold text-center mb-6">SIGN IN</div>
            <form action="/userLogin" method="POST" className="flex flex-col items-center mb-6" id="loginForm" onSubmit={fetchLogin}>
                <TextInputSmallRound id="usernameLoginInput" name="username" placeholder="Username" theme="dark" 
                className="mb-3"> </TextInputSmallRound>
                <TextInputSmallRound id="passwordLoginInput" name="password" placeholder="Password" theme="dark"
                className="mb-6"></TextInputSmallRound>
                <ButtonSmallRound type="submit" theme="dark">Submit</ButtonSmallRound>
                <div className="text-xs underline hover:cursor-pointer" onClick={() => {setLoginModalVisibility(false); setSignupModalVisibility(true)}}>Sign Up</div>
            </form>
        </Modal>
    )
}
