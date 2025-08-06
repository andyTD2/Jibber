import { useEffect } from "react"
import { useStore } from "../Store"
import CONFIG from "../config";

/*
    Establishes an event source connection with the server. When a new event is received,
    parse the event and initiate appropriate actions. Currently only supports message
    notification events.
*/
export const useMessageManager = () =>
{
    const user = useStore((state) => state.user);
    const incrementMessageNotifications = useStore((state) => state.incrementMessageNotifications);

    useEffect(() =>
    {
        if(user)
        {
            const eventSource = new EventSource(`${CONFIG.API_URL}/events`, { withCredentials: true });

            //This callback triggers whenever the server sents a new event message
            eventSource.onmessage = (event) => 
            {
                const data = JSON.parse(event.data);
                if(data["message"] == "NEW_MESSAGE")
                {
                    incrementMessageNotifications();
                }
            };

            eventSource.onerror = (error) => 
            {
                eventSource.close();
            };

            //cleanup
            return () => eventSource.close();
        }
    }, [user])
}