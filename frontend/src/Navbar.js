import { useStore } from './Store';

import SearchBar from './Searchbar';

export default function Navbar(props) {

    let msgIconHtml;
    let accountActionHtml;
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);
    if(props.user)
    {
        msgIconHtml = props.user.hasMessages ? 
            <img src="../public/msgIcon.png" className="my-auto"></img> :
            <img src="../public/msgIconEmpty.png" className="my-auto"></img>;
        accountActionHtml = <div className="my-auto mr-3">{props.user.userName}</div>;
    }
    else
    {
        msgIconHtml = <div className="my-auto">mail icon(not logged in)</div>
        accountActionHtml = <div className="my-auto mr-3" onClick={() => setLoginModalVisibility(true)}>Sign In</div>
    }

    return (
        <>
            <div className="bg-zinc-950 flex justify-center h-12 px-[2%] border-b border-solid border-zinc-100 box-border w-full">
                <div className="flex grow basis-0">
                    <img src="../public/logo192.png" className="my-auto mr-3"></img>
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
