//Components
import Navbar from './Navbar';
import Leftbar from './Leftbar';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PasswordResetModal from './PasswordResetModal';

import { useEffect } from 'react';
import { BrowserRouter} from 'react-router-dom';
import { getAuthStatus } from './utils/getUser';
import { useSavedTheme } from './hooks/useTheme';
import ContentRoutes from './ContentRoutes';

function App() {

  /*
    Check if user is logged in
  */
    useEffect(() => {
        getAuthStatus();
    }, []);
  
  // Get saved theme
    useSavedTheme();

    return (
        <BrowserRouter>
            <div className="h-full flex flex-col">
                <Navbar/>

                <div className="h-full flex overflow-y-hidden bg-altlight4 dark:bg-dark2 color-transition">
                    <Leftbar></Leftbar>
                    <ContentRoutes></ContentRoutes>
                </div>

            </div>
            <LoginModal></LoginModal>
            <SignupModal></SignupModal>
            <PasswordResetModal></PasswordResetModal>
        </BrowserRouter>
    );
}

export default App;
