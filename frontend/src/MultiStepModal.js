import ReactDOM from 'react-dom'
import { twMerge } from 'tailwind-merge';

import DotPaginationIndicator from './DotPaginationIndicator';

export default function MultiStepModal({steps, curStep, modalIsOpen, className, onClose})
{
    if(!modalIsOpen)
    {
        return null;
    }

    if(curStep >= steps.length || curStep < 0)
        return null;

    return ReactDOM.createPortal(
        <>
            <div className="overlay fixed h-full w-full top-0 left-0 bg-stone-500/50 z-5"></div>

            <div className={twMerge(`flex flex-col fixed top-1/2 left-1/2 bg-zinc-900 -translate-x-1/2 -translate-y-1/2 m-0 z-50`, className)}>
                <img className="ml-auto mt-1 mr-1 active:bg-zinc-600 hover:bg-zinc-700 bg-zinc-900 rounded-full h-5 w-5 p-1"
                src={"/close-light.png"}
                onClick={() => onClose()}></img>
                <div className="modal-main flex flex-col items-center px-6 pb-6">
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