import ReactDOM from 'react-dom'
import { twMerge } from 'tailwind-merge';
import Overlay from './Overlay';


/*
    This component renders a generic modal which can contain other components.

    modalIsOpen (bool, optional): Dictates whether the modal should be rendered or not

    className (str, optional): Additional/optional modal styling

    onClose (func, required): A callback function that is triggered when the modal is closed.
        This modal component doesn't handle state, so this function is useful for setting state
        in a parent component.

    children (ReactNode, optional): React content that should be rendered inside the modal

*/
export default function Modal(props)
{
    if(!props.modalIsOpen)
    {
        return null;
    }


    /*
        Create Portal allows this JSX to be rendered elsewhere in the DOM. It is a portal to the modals div, which can be found in public/index.html
    */
    return ReactDOM.createPortal(
        <>
            <Overlay></Overlay>

            <div className={twMerge(`shadow-md rounded-md modal-container fixed top-1/2 left-1/2 color-transition dark:bg-dark2 bg-light1 dark:text-darkText1 text-lightText1 -translate-x-1/2 -translate-y-1/2 m-0 z-50`, props.className)}>
                <img className="ml-auto mt-1 mr-1 dark:active:bg-dark5 active:bg-light4 dark:hover:bg-dark4 hover:bg-light3 dark:bg-dark2 bg-light1 rounded-full h-5 w-5 p-1"
                src={"/close-light.png"}
                onClick={props.onClose}>
                </img>
                <div className="modal-main flex flex-col px-6 pb-6">
                {props.children}
                </div>
            </div>
        </>,
    document.getElementById("modals"));
}