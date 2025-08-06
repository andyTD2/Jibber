import { useStore } from "../Store"
import CONFIG from "../config";

/*
    Check current auth status (if user is logged in) on server. If the user is logged
    in, set the user state to the server's response.
*/
export async function getAuthStatus() 
{
    const setUser = useStore.getState().setUser;
    const setProfilePicture = useStore.getState().setProfilePicture;
    const setIsAdmin = useStore.getState().setIsAdmin;

    const response = await fetch(`${CONFIG.API_URL}/me`, {
        method: "GET",
        credentials: 'include'
    });

    if(response.ok)
    {

        const { user, profilePicture, admin } = (await response.json())
        setUser(user);
        setProfilePicture(profilePicture);
        setIsAdmin(admin);
    }
    else
    {
        //Authentication failed, use this to indicate that there is no active user.
        //Note: setting this value to undefined(the initial value) means that we don't know
        //yet if there is a user. It is NOT the same as user = false
        setUser(false);
    }
}