import MultiStepModal from './MultiStepModal';
import AccountVerificationForm from './AccountVerificationForm';
import LoginForm from './LoginForm';
import AccountCreationMessage from './AccountCreationMessage';

import { useStore } from './Store';
import { useRef, useState } from 'react';


export default function LoginModal()
{
    const modalIsOpen = useStore((state) => state.loginModalIsOpen);
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen)

    const [requiresVerification, setRequiresVerification] = useState(false);
    const [curPage, setCurPage] = useState(0);

    const accountName = useRef(undefined);


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

    const handleClose = () =>
    {
        accountName.current = undefined;
        setRequiresVerification(false);
        setLoginModalVisibility(false);
        setCurPage(0);
    }

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
