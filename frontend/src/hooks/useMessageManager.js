import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useStore } from "../Store"

export const useMessageManager = () =>
{
    const user = useStore((state) => state.user);
    const incrementMessageNotifications = useStore((state) => state.incrementMessageNotifications);

    useEffect(() =>
    {
        if(user)
        {
            const eventSource = new EventSource('https://localhost:3000/events', { withCredentials: true });

            eventSource.onmessage = (event) => 
            {
                console.log(event.data);
                const data = JSON.parse(event.data);
                if(data["message"] == "NEW_MESSAGE")
                {
                    incrementMessageNotifications();
                }
            };

            eventSource.onerror = (error) => 
            {
                console.error(`Error with event source: ${error}`);
                eventSource.close();
            };

            return () => eventSource.close();
        }
    }, [user])
}