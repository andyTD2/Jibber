import { useStore } from './Store';
import { twMerge } from 'tailwind-merge';
import { useRef, useEffect } from 'react';

import Overlay from "./Overlay";
import SubscriptionList from './SubscriptionList';
import PopularBoardsList from './PopularBoardsList';
import MailNotifications from './MailNotifications';
import ThemeToggle from './ThemeToggle';

import React from 'react';
import SignOut from './SignOut';
import ViewProfile from './ViewProfile';
import SignIn from './SignIn';
import { useOutsideClick } from './hooks/useOutsideClick';
/*
    Leftbar component fetches subscription and popular boards data for the current user,
    then provides a viewable and clickable navigation list on the left side of the app
    with the appropriate boards.
*/
export default function Leftbar({className})
{
    const leftbarOpen = useStore((state) => state.hamburgerMenuOpen);
    const setLeftbarOpen = useStore((state) => state.setHamburgerMenuOpen);
    const setSignupModalIsOpen = useStore((state) => state.setSignupModalIsOpen);
    const subscriptions = useStore((state) => state.subscriptions);
    const user = useStore((state) => state.user);

    const containerRef = useOutsideClick(() => setLeftbarOpen(false));
    return(
        <>
        {leftbarOpen && <Overlay className={"z-10 lg:block hidden"}></Overlay>}
        <div ref={containerRef} className={twMerge("py-4 lg:fixed lg:top-16 lg:bottom-0 z-20 lg:h-auto h-full shadow-xl lg:overflow-y-scroll color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 w-72 min-w-72 border-r-[1px] border-zinc-700 overflow-y-auto scrollbar-thin lg:transition-transform lg:duration-500 lg:ease-in-out", className, leftbarOpen ? "lg:translate-x-0" : "lg:-translate-x-full")}>

            {user && 
            <div className='hidden md:block'>
                <ViewProfile onClick={() => setLeftbarOpen(false)} className={"-mt-2"}></ViewProfile>
                <SignOut onClick={() => setLeftbarOpen(false)}></SignOut>
                <MailNotifications size="size-6" className="h-12 px-4" onClick={() => setLeftbarOpen(false)}><div className='ml-4'>Inbox</div></MailNotifications>
                <ThemeToggle></ThemeToggle>
            </div>}
            <SignIn className={"hidden w-full px-4 md:flex"} buttonClassName={"rounded-none h-12 w-full font-bold text-2xl rounded-nones"} text="Log In"><img src="/login-light.png" className='h-8 w-10 mr-1 mt-[2px] -ml-8'></img></SignIn>
            {!user && <div className='hidden md:block px-4 py-1 text-zinc-400'>Don't have an account? <span className='underline text-primary1 hover:cursor-pointer' onClick={() => setSignupModalIsOpen(true)}>Sign Up</span></div>}

            <div className='hidden md:block h-[1px] mx-4 bg-zinc-700 my-4'></div>
            <SubscriptionList className={"px-4 w-full"}></SubscriptionList>
            {user && subscriptions.items.length > 0 && <div className='h-[1px] mx-4 bg-zinc-700 my-4'></div>}
            <PopularBoardsList className={"px-4 w-full"}></PopularBoardsList>
        </div>
        </>
    )
}

