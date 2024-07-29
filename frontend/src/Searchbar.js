import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Searchbar()
{
    const navigate = useNavigate();

    const submitForm = (e) => 
    {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get("searchQuery")

        navigate(`/search/?q=${query}`);
    }

    return (
        <div className="m-auto h-2/3 w-[600px]" id="searchbar">
            <form onSubmit={submitForm} className="w-full h-full flex">

                <input 
                    className="h-full w-full box-border text-black" 
                    type="text" 
                    name="searchQuery" 
                    placeholder="Search"
                />

                <input 
                    className="h-full" 
                    type="image" 
                    src="../search.png" 
                    alt="Submit Search"
                />

                <Link to={`/search?${Date.now()}`}>tea</Link>
            </form>
        </div>
    )
}