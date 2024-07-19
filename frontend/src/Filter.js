import { useState } from "react"

export default function Filter({currentFilter, updateFilter, filters})
{
    const [filterMenuVisible, setFilterMenuVisibility] = useState(false);

    return (
        <div className="flex items-center bg-zinc-950 h-8 mb-2 max-w-fit" 
        onMouseEnter={() => setFilterMenuVisibility(true)} 
        onMouseLeave={() => setFilterMenuVisibility(false)}
        >
            <div className="ml-2 mr-2 text-zinc-400">SORT: <span className="text-orange-600">{currentFilter.toUpperCase()}</span></div>
            { filterMenuVisible && <div className={`flex`}>
                {
                    filters.map((filter) => {
                        if(filter != currentFilter)
                        {
                            return <div className="px-2 hover:bg-zinc-700"
                            onClick={() => {updateFilter(filter); setFilterMenuVisibility(false)}}
                            key={filter}>{filter.toUpperCase()}</div>
                        }
                    }
                )}
            </div>}
        </div>
    )
}