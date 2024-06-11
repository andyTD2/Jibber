import Feed from "./Feed.js";
import Post from "./Post.js";
import Board from "./Board.js";
import { Route, Routes } from 'react-router-dom';

export default function MainContent()
{
    return (
        <>
            <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/r/:subreddit" element={<Board />} />
                <Route path="/r/:subreddit/post/:postId" element={<Post />}/>
            </Routes>
        </>
    )
}