import ReactDOM from 'react-dom'
import { twMerge } from 'tailwind-merge';

export default function Modal(props)
{
    if(!props.modalIsOpen)
    {
        return null;
    }

    let modalClassNames = twMerge(`rounded-md modal-container fixed top-1/2 left-1/2 bg-zinc-900 -translate-x-1/2 -translate-y-1/2 m-0 z-50`, props.className)

    return ReactDOM.createPortal(
        <>
            <div className="overlay fixed h-full w-full top-0 left-0 bg-stone-500/50 z-5"></div>

            <div className={modalClassNames}>
                <img className="ml-auto mt-1 mr-1 active:bg-zinc-600 hover:bg-zinc-700 bg-zinc-900 rounded-full h-5 w-5 p-1"
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