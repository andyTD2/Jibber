//Components
import Navbar from './Navbar';
import Leftbar from './Leftbar';
import Feed from './Feed';
import Post from './Post';
import Rightbar from './Rightbar';
import LoginModal from './LoginModal';
import SignupModal from './SigninModal';
import { useEffect } from 'react';
import { useStore } from './Store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getAuthStatus } from './utils/getUser';

function App() {

  useEffect(() => {
    getAuthStatus();
  }, []);

  return (
    <BrowserRouter>
      <div className="h-full flex flex-col">
        <Navbar boardName="HOME"/>

        <div className="h-full flex overflow-y-hidden bg-zinc-900">
          <Leftbar  user={{savedCommunities: ["test community 1", "test community 2", "test community 3", "test community 4"]}}
                    popularCommunities={["test popular community 1", "test popular community 2", "test popular community 3", "test popular community 4"]} />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/r/:subreddit" element={<Feed />} />
            <Route path="/r/:subreddit/post/:postId" element={<Post />}/>
          </Routes>
          <Rightbar />
        </div>

      </div>
      <LoginModal></LoginModal>
      <SignupModal></SignupModal>
    </BrowserRouter>
  );
}

export default App;
