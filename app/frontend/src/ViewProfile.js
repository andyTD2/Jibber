import { useStore } from './Store';

import { twMerge } from "tailwind-merge";

import { Link } from 'react-router-dom';

export default function ViewProfile({className, onClick})
{
    const user = useStore(state => state.user);
    const profilePicture = useStore(state => state.profilePicture);

    return (
        <Link to={`/u/${user}`} onClick={onClick} className={twMerge("hover:cursor-pointer p-4 flex flex-row items-center hover:bg-altlight3 dark:hover:bg-dark3", className)}>
            <img className='hover:cursor-pointer hover:outline-[7px] hover:outline outline-primary2 rounded-full object-cover w-11 h-11 shadow-light dark:shadow-lightShadow-light' src={profilePicture}></img>
            <div className='flex flex-col ml-4 overflow-x-hidden'>
                <div className='text-xl font-bold hover:underline hover:cursor-pointer'>View Profile</div>
                <div className='text-[.75rem] font-semibold overflow-x-hidden whitespace-nowrap text-ellipsis text-zinc-700 dark:text-zinc-400'>{user}</div>
            </div>
        </Link>
    )
}