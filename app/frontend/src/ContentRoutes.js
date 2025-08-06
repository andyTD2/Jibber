import Profile from "./Profile.js";
import SearchResults from "./SearchResults.js";
import { Route, Routes, ScrollRestoration } from 'react-router-dom';

import Board from "./Board.js";
import MessageDashboard from "./MessageDashboard.js";

import { useMessageManager } from "./hooks/useMessageManager.js";

/*
    Routes for our main content
*/
export default function ContentRoutes()
{
    /*
        Subscribes to an event source on the server, which notifies us whenever we get new messages.
    */
    useMessageManager();

    return (
        <>
            <Routes>
                <Route path="/*" element={<Board />} />
                <Route path="/b/:boardName/*" element={<Board />} />
                <Route path="/u/:profile/*" element={<Profile />} />
                <Route path="/search/*" element={<SearchResults />} />
                <Route path="/messages" element={<MessageDashboard />} />
            </Routes>
        </>
    )
}
