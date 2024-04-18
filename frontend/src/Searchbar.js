export default function Searchbar()
{
    //(<div className="searchbar">SEARCHBAR</div>);
    return (
        <div className="m-auto h-2/3 w-[600px]" id="searchbar">
            <form action="/search" method="POST" className="w-full h-full flex">
                <input className="h-full w-full box-border" type="text" name="searchQuery" placeholder="Search" />
                <input className="h-full" type="image" src="../search.png" alt="Submit Search"/>
            </form>
        </div>
    )
}