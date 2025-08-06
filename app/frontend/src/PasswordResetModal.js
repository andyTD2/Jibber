import MultiStepModal from './MultiStepModal';
import PasswordCodeVerificationForm from './PasswordCodeVerificationForm';
import UsernameInputForm from './UsernameInputForm';
import NewPasswordInputForm from './NewPasswordInputForm';

import { useStore } from './Store';
import { useState, useRef } from 'react';

/*
    This modal handles the password reset workflow. Users must first input 
    their username. The server then sends a verification code to their email, which they must
    input in the next step. Once verified, the user is allowed to input the new password. Each
    of these steps has a different component (and page within the modal) associated with it.
    This component manages each step and communication between them.
*/
export default function PasswordResetModal()
{
    // These stored states allow us to open/close modals from anywhere
    const modalIsOpen = useStore((state) => state.passwordResetModalIsOpen)
    const setPasswordResetModalIsOpen = useStore((state) => state.setPasswordResetModalIsOpen)
    const setLoginModalIsOpen = useStore((state) => state.setLoginModalIsOpen)

    const [curPage, setCurPage] = useState(0);
    const accountName = useRef(undefined);
    const verificationCode = useRef(undefined);

    // Close the modal, burst first flush all data
    const handleClose = () => {
        accountName.current = undefined;
        verificationCode.current = undefined;
        setPasswordResetModalIsOpen(false);
        setCurPage(0);
    }

    /*
        Each step represents a different component being rendered on its own page in the modal.
        These steps outline the order of the password reset workflow.
    */
    const steps = 
    [
        <UsernameInputForm 
            onSubmit={(results) => {accountName.current = results.username; setCurPage(1)}}>
        </UsernameInputForm>,

        <PasswordCodeVerificationForm 
            username={accountName.current} 
            onVerification={(results) => {verificationCode.current = results.verificationCode; setCurPage(2)}}>
        </PasswordCodeVerificationForm>,

        <NewPasswordInputForm
            username={accountName.current}
            verificationCode={verificationCode.current}
            onRedirect={() => {handleClose(); setLoginModalIsOpen(true)}}
        ></NewPasswordInputForm>,

        
    ]


    return (
        <MultiStepModal 
            onClose={handleClose} 
            modalIsOpen={modalIsOpen} 
            steps={steps}
            curStep={curPage}
            className={"rounded-md w-72 min-h-[22rem]"}
        />
    )
}
