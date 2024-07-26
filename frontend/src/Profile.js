import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"

import { getData } from "./utils/fetch";

import { MemoizedBanner } from "./Banner";
import { MemoizedSidebar } from "./Sidebar";
import { MemoizedFeed } from "./Feed";

const validFilters = new Set(["top", "new"]);
const defaultFilter = "new";

export default function Profile()
{
    const {profile} = useParams();

    const [bannerData, setBannerData] = useState(undefined);
    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`https://localhost:3000/u/${profile}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.profile)
                    setBannerData(data.profile);
                else
                    setBannerData(undefined);
            }   
        }
        fetchProfile();
    }, [profile])

    const loadFeedContent = async function(queryParams, onSuccess)
    {
        const baseRoute = `https://localhost:3000/u/${profile}/feed`;
        getData({   baseRoute,
                    queryParams,
                    onSuccess
        })
    }

    return (
    <div className="flex flex-col w-full px-12 overflow-y-scroll scrollbar">
        {bannerData && <MemoizedBanner bannerTitle={bannerData.userName} bannerDescription={bannerData.description}></MemoizedBanner>}
        <div className="flex w-full">
            <MemoizedFeed
                validFilters={validFilters}
                defaultFilter={defaultFilter}
                hideUserName={true}
                fetchFeedContent={useCallback(loadFeedContent, [])}
            ></MemoizedFeed>
            {bannerData && 
            <div className="w-1/3 mt-10 ml-12 ">
                <MemoizedSidebar sidebarContent={bannerData.bio}></MemoizedSidebar>
            </div>
            }
        </div>
    </div>
    )
}