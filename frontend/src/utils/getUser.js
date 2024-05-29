import { useStore } from "../Store"

export async function getAuthStatus() 
{
    const response = await fetch("https://localhost:3000/me", {
        method: "GET",
        credentials: 'include'
    });

    if(response.ok)
    {
        const setUser = useStore.getState().setUser;
        const setSubscriptionsList = useStore.getState().setSubscriptionsList;

        const { user, subscriptionsList } = (await response.json())
        setUser(user);
        setSubscriptionsList(subscriptionsList);
    }
}