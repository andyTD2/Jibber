import Board from "./Board.js";
import Profile from "./Profile.js";
import SearchResults from "./SearchResults.js";
import { Route, Routes } from 'react-router-dom';

export default function MainContent()
{
    return (
        <>
            <Routes>
                <Route path="/*" element={<Board />} />
                <Route path="/r/:subreddit/*" element={<Board />} />
                <Route path="/u/:profile/*" element={<Profile />} />
                <Route path="/search" element={<SearchResults />} />
                {/* <Route path="/r/:subreddit/post/:postId" element={<Post />}/> */}
            </Routes>
        </>
    )
}