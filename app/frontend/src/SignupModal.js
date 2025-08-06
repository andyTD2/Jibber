import MultiStepModal from './MultiStepModal';
import SignupForm from './SignupForm';
import AccountVerificationForm from './AccountVerificationForm';
import AccountCreationMessage from './AccountCreationMessage';

import { useState, useRef } from 'react';
import { useStore } from './Store';


/*
    SignupModal initiates a multi step modal for the signup procedure. It handles communication
    between each individual step and step transitions.
*/
export default function SignupModal()
{
    const modalIsOpen = useStore((state) => state.signupModalIsOpen)
    const setSignupModalVisibility = useStore((state) => state.setSignupModalIsOpen)

    const [curPage, setCurPage] = useState(0);
    const accountName = useRef(undefined);

    /*
        On close, flush accountName data and curPage, then set the modal to hidden.
    */
    const handleClose = () => {
        accountName.current = undefined;
        setSignupModalVisibility(false);
        setCurPage(0);
    }

    /*
        Outlines the steps for signup procedure. First submit the signup form,
        verify the account, then display the welcome message.
    */
    const steps = 
    [
        <SignupForm onSignup={(newAccountName) => {accountName.current = newAccountName; setCurPage(1)}}></SignupForm>,
        <AccountVerificationForm username={accountName.current} onVerification={() => setCurPage(2)}></AccountVerificationForm>,
        <AccountCreationMessage onClose={handleClose} username={accountName.current}></AccountCreationMessage>
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
