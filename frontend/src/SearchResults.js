import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import { getData } from "./utils/fetch";

import { Feed } from "./Feed";


const validFilters = new Set(["top", "new"]);
const defaultFilter = "new";

export default function SearchResults()
{
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q");

    const loadFeedContent = async function(queryParams, onSuccess)
    {
        const baseRoute = `https://localhost:3000/search`;
        getData({   baseRoute,
                    queryParams: {...queryParams, "q": searchQuery},
                    onSuccess
        })
    }

    return (
        <div className="px-12 w-full">
            <Feed 
                deps={[searchQuery]}
                validFilters={validFilters}
                defaultFilter={defaultFilter}
                hideUserName={true}
                fetchFeedContent={useCallback(loadFeedContent, [searchQuery])}
            ></Feed>
        </div>
    )
}