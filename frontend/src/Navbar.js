import { useStore } from './Store';
import { useNavigate } from 'react-router-dom';

import { getData } from './utils/fetch';
import { Link } from 'react-router-dom';

import SearchBar from './Searchbar';
import MailNotifications from './MailNotifications';

export default function Navbar(props) {
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    const user = useStore((state) => state.user);
    const setUser = useStore.getState().setUser;
    const navigate = useNavigate();

    const handleLogout = () =>
    {
        getData(
            {
                baseRoute: "https://localhost:3000/userLogout",
                onSuccess: () => 
                {
                    setUser(undefined);
                    navigate("/");
                }
            })
    }


    let userMenu;
    if(user)
    {
        userMenu = (
            <>
                <div className='px-2 hover:bg-zinc-700 hover:cursor-pointer h-full flex items-center'><Link to={`/u/${user}`}><div className="my-auto">{user}</div></Link></div>
                <MailNotifications className="px-2 flex items-center hover:bg-zinc-700 hover:cursor-pointer" user={user}></MailNotifications>
                <div className='px-2 h-full hover:bg-zinc-700 flex items-center hover:cursor-pointer' onClick={handleLogout}><img src="/logoff-light.png" className='my-auto w-5 h-5'></img></div>

            </>
        )
    }
    else
    {
        userMenu = (
            <>
                <div className='h-full flex items-center hover:bg-zinc-700 hover:cursor-pointer px-2'><div onClick={() => setLoginModalVisibility(true)}>Sign In</div></div>
            </>
        )
    }

    return (
        <>
            <div className="z-10 bg-zinc-950 flex items-center justify-center h-10 px-[2%] border-b border-solid border-zinc-100 box-border w-full">
                <div className="h-full flex grow basis-0">
                    <img src="/logo192.png" className="my-auto mr-3 w-6 h-6 object-cover"></img>
                    <Link to="/"><div className="flex items-center h-full hover:bg-zinc-700 px-2"><span>FRONTPAGE</span></div></Link>
                </div>
                <SearchBar />
                <div className="h-full flex grow basis-0 justify-end items-center">
                    {userMenu}
                </div>
            </div>
        </>
    );
}
