import { useStore } from './Store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { getData } from './utils/fetch';
import { Link } from 'react-router-dom';

import CONFIG from "./config"

import SearchBar from './Searchbar';
import MailNotifications from './MailNotifications';
import ThemeToggle from './ThemeToggle';
import Button from "./Button";
import DropdownMenu from './DropdownMenu';
import ViewProfile from './ViewProfile';
import SignOut from './SignOut';
import SignIn from './SignIn';

/*
    This component manages and renders the NavBar of the app. It contains the logo (linked to the frontpage),
    the search bar, and user-related controls.
*/
export default function Navbar() {

    const user = useStore((state) => state.user);
    const profilePicture = useStore((state) => state.profilePicture);
    const hamburgerMenuOpen = useStore(state => state.hamburgerMenuOpen);
    const setHamburgerMenuOpen = useStore(state => state.setHamburgerMenuOpen);
    const theme = useStore((state) => state.theme);

    const [userDropdownIsOpen, setUserDropdownIsOpen] = useState(false);

    // The "right side" of the navbar, representing user specific actions
    let userMenu;
    if(user)
    {
        userMenu = (
            <>
                <MailNotifications className="hover:outline-[7px] hover:outline outline-primary2 flex items-center justify-center rounded-full min-w-11 w-11 h-11 dark:hover:bg-dark4 hover:bg-light3 hover:cursor-pointer mx-4" user={user}></MailNotifications>
                <div className='mx-4 flex items-center justify-center relative min-w-11'>
                        <img className='hover:cursor-pointer hover:outline-[7px] hover:outline outline-primary2 rounded-full object-cover w-11 h-11 shadow-light dark:shadow-lightShadow-light' src={profilePicture} onClick={() => setUserDropdownIsOpen(!userDropdownIsOpen)}></img>
                        <DropdownMenu isOpen={userDropdownIsOpen} onOutsideClick={() => setUserDropdownIsOpen(false)}>
                            <div className='w-60'>
                                <ViewProfile className={"rounded-t-md"} onClick={() => setUserDropdownIsOpen(false)}></ViewProfile>
                                <SignOut onClick={() => setUserDropdownIsOpen(false)}></SignOut>
                                <ThemeToggle className={"rounded-b-md"}></ThemeToggle>
                            </div>
                        </DropdownMenu>
                </div>

            </>
        )
    }
    else if (!user)
    {
        //If no user is present, show the sign in button
        userMenu = (
            <SignIn text={"Log In / Sign Up"} buttonClassName={"font-extrabold"}></SignIn>
        )
    }


    return (
        <>
            <div className="z-20 shadow-xl color-transition dark:bg-dark1 bg-light1 dark:text-darkText1 text-lightText1 flex items-center justify-center min-h-16 h-16 border-b border-solid dark:border-zinc-700 border-zinc-950 box-border w-full">
                <div className="h-full flex grow basis-0">
                    {!hamburgerMenuOpen && <div className='h-full self-center justify-self-center hidden lg:flex lg:items-center px-4 hover:dark:bg-dark4 dark:active:bg-dark5 hover:bg-light4 active:bg-light5' onClick={() => setHamburgerMenuOpen(true)}><img src={theme == "dark" ? "/burger-menu-light.png" : "/burger-menu-dark.png"} className='size-9 min-w-9 object-cover'></img></div>}
                    {hamburgerMenuOpen && <div className='h-full self-center justify-self-center hidden lg:flex lg:items-center px-4 dark:bg-dark4 dark:hover:bg-dark3 dark:active:bg-dark5 bg-light4 hover:bg-light3 active:bg-light5' onClick={() => setHamburgerMenuOpen(false)}><img src={theme == "dark" ? "/burger-menu-light.png" : "/burger-menu-dark.png"} className='size-9 min-w-9 object-cover'></img></div>}
                    <Link to="/" className='flex items-center'>
                        <img src="/logo-boxed-lightpurp.png" className="my-auto mx-4 h-9 min-w-9 object-cover"></img>
                        <img src="/jibber-lightpurp-border-2x.png" className='h-10 lg:hidden'></img>
                    </Link>
                </div>
                {/* <div>TESTTTTTTTTTTTTTTTTTTTTTTTTTTT</div> */}
                <SearchBar />
                <div className="md:hidden h-full flex grow basis-0 justify-end items-center">
                    {/* If a user is undefined, it means we haven't yet checked if they have a saved
                    session or not. If they do, the user value is populated with username, otherwise
                    it is set to false. This gives us control over displaying the userMenu, the sign in
                    button, or nothing at all. In other words

                    user = undefined - Don't render anything (we don't want the sign in button 
                        to flicker before switching to userMenu)

                    user = false - Checked user credentials and found nothing; no user exists (displaying
                        the sign in button)

                    user = truthy - User exists, display userMenu */}
                    {user != undefined && userMenu}
                </div>
            </div>
        </>
    );
}
