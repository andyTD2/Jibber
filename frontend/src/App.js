//Components
import Navbar from './Navbar';
import Leftbar from './Leftbar';
import MainContent from './MainContent';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
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
        <Navbar/>

        <div className="h-full flex overflow-y-hidden bg-zinc-900">
          <Leftbar  user={{savedCommunities: ["test community 1", "test community 2", "test community 3", "test community 4"]}}
                    popularCommunities={["test popular community 1", "test popular community 2", "test popular community 3", "test popular community 4"]} />
          <MainContent></MainContent>
        </div>

      </div>
      <LoginModal></LoginModal>
      <SignupModal></SignupModal>
    </BrowserRouter>
  );
}

export default App;
