import { useParams, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"

import { getData } from "./utils/fetch";

import { MemoizedBanner } from "./Banner";
import { MemoizedSidebar } from "./Sidebar";
import { MemoizedFeedManager } from "./FeedManager";
import ProfileControls from "./ProfileControls";
import ProfileEditor from "./ProfileEditor";
import { useStore } from "./Store";
import HTMLBearingDiv from "./HTMLBearingDiv";
import MetricsBanner from "./MetricsBanner";

const validFilters = new Set(["top", "new"]);
const defaultFilter = "new";

export default function Profile()
{
    const {profile} = useParams();

    const [profileData, setProfileData] = useState(undefined);
    const user = useStore((state) => state.user);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`https://localhost:3000/u/${profile}`, {method: "GET", credentials: "include"});
            if(response.ok)
            {
                let data = await (response.json());
                console.log("data", data);
                if(data.profile)
                {
                    data.profile.created_at = new Date(data.profile.created_at);
                    setProfileData(data.profile);
                }
                else
                    setProfileData(undefined);
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

    console.log("d", profileData)
    return (
    <div className="w-full px-12 overflow-y-scroll scrollbar">
        {profileData && <MemoizedBanner bannerPictureLink={profileData.profilePic} bannerLink={`/u/${profileData.userName}`} bannerTitle={profileData.userName} bannerDescription={profileData.description} className="rounded-bl-none">
        <MetricsBanner 
            metrics={{
                        Score: profileData.numVotes, 
                        Joined: profileData.created_at.toLocaleDateString('en-US', {year: 'numeric', month: 'long'})
                    }}>            
        </MetricsBanner>
        </MemoizedBanner>}
        <div className="flex w-full">
            <Routes>

                <Route path="" element={
                    <>
                    <MemoizedFeedManager
                        deps={profile}
                        validFilters={validFilters}
                        defaultFilter={defaultFilter}
                        hideUserName={true}
                        fetchFeedContent={useCallback(loadFeedContent, [profile])}
                    ></MemoizedFeedManager>
                    </>
                } />

                {profileData && <Route path="edit" element={<ProfileEditor profileData={profileData} user={user} setProfileData={setProfileData}></ProfileEditor>} />}
            </Routes>
            {profileData && 
            <div className="w-1/3 mt-10 ml-12 ">
                {user && user.toLowerCase() == profile.toLowerCase() && <ProfileControls profile={profileData.userName}></ProfileControls>}
                <MemoizedSidebar sidebarContent={<HTMLBearingDiv htmlContent={profileData.bio}></HTMLBearingDiv>}></MemoizedSidebar>
            </div>}
        </div>
    </div>
    )
}