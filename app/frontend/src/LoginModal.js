import MultiStepModal from './MultiStepModal';
import AccountVerificationForm from './AccountVerificationForm';
import LoginForm from './LoginForm';
import AccountCreationMessage from './AccountCreationMessage';

import { useStore } from './Store';
import { useRef, useState } from 'react';

/*
    Provides a container modal for the LoginForm component. Also redirects logged in
    users whose accounts have not yet been verified. 
*/
export default function LoginModal()
{
    const modalIsOpen = useStore((state) => state.loginModalIsOpen);
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen)

    const [requiresVerification, setRequiresVerification] = useState(false);
    const [curPage, setCurPage] = useState(0);

    const accountName = useRef(undefined);

    /*
        Checks if account verification is required. If so, set the corresponding requiresVerification
        state to true, which will trigger a verification request for the user. Otherwise, close the modal.

        user (obj, required): user data returned by the server. For the purposes of this function,
            it requires the "requiresVerification" entry, which is a bool indicating verification status.
    */
    const handleLogin = (user) =>
    {
        if(user.requiresVerification)
        {
            accountName.current = user.user;
            setRequiresVerification(true);
            setCurPage(1);
        }
        else
            setLoginModalVisibility(false);
    }

    /*
        Close the modal. Flush account name variable
    */
    const handleClose = () =>
    {
        accountName.current = undefined;
        setRequiresVerification(false);
        setLoginModalVisibility(false);
        setCurPage(0);
    }

    /*
        Steps is an array of pages for the MultiStepModal component. Each entry represents one page or "step".
        If the account requires verification, add the verification steps to the multi step modal and pass
        the required information such as current account name.
    */
    const steps = [<LoginForm onLogin={handleLogin}></LoginForm>];
    if(requiresVerification)
    {
        steps.push(<AccountVerificationForm onVerification={() => setCurPage(2)} username={accountName.current}></AccountVerificationForm>);
        steps.push(<AccountCreationMessage onClose={handleClose} username={accountName.current}></AccountCreationMessage>);
    }

    return (
        <MultiStepModal 
            onClose={handleClose} 
            modalIsOpen={modalIsOpen} 
            steps={steps}
            curStep={curPage}
            className={"rounded-md w-72 min-h-72"}
        />
    )
}
