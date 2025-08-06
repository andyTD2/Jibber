import { useStore } from './Store';
import { useNavigate } from "react-router-dom";

import { twMerge } from "tailwind-merge";
import { getData } from "./utils/fetch";

import CONFIG from "./config"

export default function SignOut({className, onClick})
{
    const theme = useStore(state => state.theme);
    const setUser = useStore(state => state.setUser);
    const setIsAdmin = useStore(state => state.setIsAdmin);
    const setProfilePicture = useStore(state => state.setProfilePicture);
    const navigate = useNavigate();

    /*
        Send a logout request to the server, then logout clientside.
    */
    const handleLogout = () =>
    {
        getData(
            {
                baseRoute: `${CONFIG.API_URL}/userLogout`,
                onSuccess: () => 
                {
                    setUser(false);
                    setIsAdmin(false);
                    setProfilePicture(undefined);
                    navigate("/");
                }
            })
    }

    return (
        <div className={twMerge("px-4 flex items-center h-12 w-full hover:bg-altlight3 dark:hover:bg-dark3 hover:cursor-pointer", className)} onClick={() => {handleLogout(); if(onClick) onClick();}}>
            <div className='w-8 mr-2'>
                <img src={theme == "dark" ? "/logoff-light.png" : "/logoff-dark.png"} className='w-6 h-5'></img>
            </div>
            Sign Out
        </div>
    )
}