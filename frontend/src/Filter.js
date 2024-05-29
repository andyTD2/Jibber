import { useState } from "react"

export default function Filter({currentFilter, setCurrentFilter, filters})
{
    const [filterMenuVisible, setFilterMenuVisibility] = useState(false);
    const menuVisibility = filterMenuVisible ? "" : "hidden";

    return (
        <div className="flex items-center bg-zinc-950 h-8 mb-2 w-min" 
        onMouseEnter={() => setFilterMenuVisibility(true)} 
        onMouseLeave={() => setFilterMenuVisibility(false)}
        >
            <div className="ml-2 mr-2 text-orange-600">{currentFilter}</div>
            <div className={`flex ${menuVisibility}`}>
                {
                    filters.map((filter) => {
                        if(filter != currentFilter)
                        {
                            return <div className="px-2 hover:bg-zinc-700"
                            onClick={() => {setCurrentFilter(filter); setFilterMenuVisibility(false)}}
                            >{filter}</div>
                        }
                    }
                )}
            </div>
        </div>
    )
}