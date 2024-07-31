import { useStore } from './Store';

import SearchBar from './Searchbar';

export default function Navbar(props) {

    let msgIconHtml;
    let accountActionHtml;
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    const user = useStore((state) => state.user);
    if(user)
    {
        msgIconHtml = user.hasMessages ? 
            <img src="/mail-icon-light.png" className="my-auto w-5 h-5"></img> :
            <img src="/mail-icon-light.png" className="my-auto w-5 h-5"></img>;
        accountActionHtml = <div className="my-auto mr-3">{user}</div>;
    }
    else
    {
        msgIconHtml = <div className="my-auto">mail icon(not logged in)</div>
        accountActionHtml = <div className="my-auto mr-3" onClick={() => setLoginModalVisibility(true)}>Sign In</div>
    }

    return (
        <>
            <div className="z-10 bg-zinc-950 flex justify-center max-h-10 min-h-10 px-[2%] border-b border-solid border-zinc-100 box-border w-full">
                <div className="flex grow basis-0">
                    <img src="/logo192.png" className="my-auto mr-3 w-6 h-6 object-cover"></img>
                    <div className="my-auto mr-3">TAKE!</div>
                    <div className="my-auto mr-3">&gt;</div>
                    <div className="my-auto">{props.boardName}</div>
                </div>
                <SearchBar />
                <div className="flex grow basis-0 justify-end">
                    {accountActionHtml}
                    {msgIconHtml}
                </div>
            </div>
        </>
    );
}
