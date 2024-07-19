import Modal from './Modal';
import TextInputSmallRound from './TextInputSmallRound';
import { useStore } from './Store';
import Button from './Button';

export default function SignupModal()
{
    const modalIsOpen = useStore((state) => state.signupModalIsOpen)
    const setSignupModalVisibility = useStore((state) => state.setSignupModalIsOpen)

    return (
        <Modal onClose={() => setSignupModalVisibility(false)} modalIsOpen={modalIsOpen}>
            <div className="text-white text-3xl font-bold text-center mb-6">SIGN UP</div>
            <form action="/userSignup" method="POST" className="flex flex-col items-center" id="signupForm">
                <TextInputSmallRound id="usernameSignupInput" name="username" placeholder="Username" theme="dark" 
                className="mb-3"> </TextInputSmallRound>
                <TextInputSmallRound id="passwordSignupInput" name="password" placeholder="Password" theme="dark"
                className="mb-6"></TextInputSmallRound>
                <Button type="submit">Submit</Button>
            </form>
        </Modal>
    )
}
