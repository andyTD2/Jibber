import ReactDOM from 'react-dom'
import { twMerge } from 'tailwind-merge';
import { useStore } from './Store';

import Overlay from './Overlay';
import DotPaginationIndicator from './DotPaginationIndicator';

/*
    This component renders a generic modal which can contain other components.
    This modal can contain multiple pages or "steps".

    steps ([ReactNode], required): An array of ReactNodes(components) to render. Each index represents 
        a different page.

    curStep (int, optional, default: 0): The current step or "page" that the modal should be rendering.

    modalIsOpen (bool, optional): Dictates whether the modal should be rendered or not

    className (str, optional): Additional/optional modal styling

    onClose (func, required): A callback function that is triggered when the modal is closed.
        This modal component doesn't handle open/closed state, so this function is useful for 
        setting state in a parent component.

*/

export default function MultiStepModal({steps, curStep = 0, modalIsOpen, className, onClose})
{
    const theme = useStore((state) => state.theme);

    if(!modalIsOpen)
    {
        return null;
    }

    if(curStep >= steps.length || curStep < 0)
        return null;


    /*
        Create Portal allows this JSX to be rendered elsewhere in the DOM. It is a portal to the modals div, which can be found in public/index.html
    */
    return ReactDOM.createPortal(
        <>
            <Overlay></Overlay>

            <div className={twMerge(`shadow-md flex flex-col fixed top-1/2 left-1/2 color-transition dark:bg-dark2 bg-light1 -translate-x-1/2 -translate-y-1/2 m-0 z-50`, className)}>
                <img className="ml-auto mt-1 mr-1 dark:active:bg-dark5 active:bg-light4 dark:hover:bg-dark4 hover:bg-light3 dark:bg-dark2 bg-light1 rounded-full h-5 w-5 p-1"
                src={theme == "dark" ? "/close-light.png" : "/close-dark.png"}
                onClick={() => onClose()}></img>
                <div className="modal-main flex flex-col items-center px-6 pb-6">
                {/* Render the correct page */}
                {steps[curStep]}
                </div>

                {steps.length > 1 &&
                    <div className='flex flex-col mt-auto mb-2'>
                        <DotPaginationIndicator numPages={steps.length} curPage={curStep} className="self-center"></DotPaginationIndicator>
                    </div>
                }
            </div>
        </>,
    document.getElementById("modals"));
}