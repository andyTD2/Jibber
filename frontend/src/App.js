//Components
import Navbar from './Navbar';
import Leftbar from './Leftbar';
import Feed from './Feed';
import Rightbar from './Rightbar';
import LoginModal from './LoginModal';
import SignupModal from './SigninModal';
import { useEffect } from 'react';
import { useStore } from './Store';

function App() {

  const setUser = useStore((state) => state.setUser);
  useEffect(() => {

    const getAuthStatus = async () => {
      const response = await fetch("https://localhost:3000/me", {
        method: "GET",
        credentials: 'include'
      });

      console.log(response);
      if(response.ok)
      {
        const user = (await response.json()).user
        setUser(user);
      }
    }

    getAuthStatus();
  }, []);


  return (
    <>
      <div className="h-full flex flex-col">
        <Navbar boardName="HOME"/>

        <div className="h-full flex overflow-y-hidden">
          <Leftbar  user={{savedCommunities: ["test community 1", "test community 2", "test community 3", "test community 4"]}}
                    popularCommunities={["test popular community 1", "test popular community 2", "test popular community 3", "test popular community 4"]} />
          <Feed contentItems={["content item 1", "content item 2", "content item 3", "content item 4", "content item 5", "content item 6"]} />
          <Rightbar />
        </div>

      </div>
      <LoginModal></LoginModal>
      <SignupModal></SignupModal>
    </>
  );
}

export default App;
