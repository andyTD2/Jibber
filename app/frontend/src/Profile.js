import { useParams, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"
import { useStore } from "./Store";
import { useTitle } from "./hooks/useTitle";
import { useScroll } from "./hooks/useScroll";

import { getData } from "./utils/fetch";
import CONFIG from "./config"

import { MemoizedBanner } from "./Banner";
import { MemoizedSidebar } from "./Sidebar";
import { MemoizedFeedManager } from "./FeedManager";
import ProfileControls from "./ProfileControls";
import ProfileEditor from "./ProfileEditor";
import HTMLBearingDiv from "./HTMLBearingDiv";
import MetricsBanner from "./MetricsBanner";
import ProfileBanner from "./ProfileBanner";
import ContentPanel from "./ContentPanel";
import { ExpandableDiv } from "./ExpandableDiv";

//These are the allowed filters for user history feeds
const validFilters = {
    "top": "TOP",
    "new": "NEW"
}
const defaultFilter = "new";

const validTimeFilters = 
{
  day: "Past Day",
  week: "Past Week",
  month: "Past Month",
  year: "Past Year",
  all: "All Time"
}
const defaultTimeFilter = "all";


/*
    The Profile component handles all functions/features related towards user profiles.
    The default view shows the profile's metadata and comment/post history. Profile owners 
    can also edit their profile as well.
*/
export default function Profile()
{
    const {profile} = useParams();
    const {scrollRef, restoreScrollPos} = useScroll();

    const [profileData, setProfileData] = useState(undefined);
    const [error, setError] = useState(undefined);

    const user = useStore((state) => state.user);

    const savedFeed = useStore(state => state.savedFeed);
    const setSavedFeed = useStore(state => state.setSavedFeed);

    const location = useLocation();

    useTitle(`${profile}'s Profile`)

    /*
        Fetch the profile data from the backend. On success, create a date object from the timestamp,
        then store the profile data into profileData state. This function is called everytime the
        currently viewed profile changes.
    */
    useEffect(() => {
        const fetchProfile = async () => {
            getData({
                baseRoute: `${CONFIG.API_URL}/u/${profile}`,
                onSuccess: (profile) => {
                    if(profile)
                    {
                        profile.createdAt = new Date(profile.createdAt);
                        setProfileData(profile);
                    }
                    else
                        setProfileData(undefined);
                },
                onFailure: (error) => {
                    setProfileData(undefined);
                    setError(error.error);
                }
            })
        }
        fetchProfile();
    }, [profile])

    /*
        Fetches the profile's post/comment history. Passes queryParams to the server, and calls'
        onSuccess after successfully retrieving the data
    */
    const loadFeedContent = async function(queryParams, onSuccess, onFailure)
    {
        const baseRoute = `${CONFIG.API_URL}/u/${profile}/feed`;
        getData({   baseRoute,
                    queryParams,
                    onSuccess,
                    onFailure
        })
    }

    if(error)
    {
        return (
            <div className="rounded-md bg-opacity-50 text-center m-4 p-2 text-red-500 text-2xl bg-altlight7 w-full h-min">{error}</div>
        )
    }

    if(!profileData)
    {
        return null;
    }

    return (
    <div className="w-full px-12 firefox:lg:pr-3 firefox:md:pr-2 lg:px-3 lg:pr-1 md:px-2 md:pr-0 overflow-y-scroll" ref={scrollRef}>

        {/* Profile banner/header */}
        {profileData && 
            <>
            <ProfileBanner data={profileData} className={"lg:hidden"}></ProfileBanner>
            <ExpandableDiv 
                preview={
                    <>
                    <ProfileBanner data={profileData} className={"lg:mb-0 lg:rounded-b-none lg:pb-0 text-start"}></ProfileBanner>
                    {user && user.toLowerCase() == profile.toLowerCase() && 
                        <ProfileControls 
                            className="shadow-none px-2 gap-x-2 hidden lg:flex lg:flex-wrap bg-transparent dark:bg-transparent min-h-fit mb-0 rounded-none" 
                            btnClassName={"w-fit lg:h-12 text-base mb-0"}
                            profile={profileData.username}>
                        </ProfileControls>}
                    </>
                }
                expandableContent={<MemoizedSidebar className={"mt-2 mx-3 px-0 border-t-[1px] border-zinc-700 rounded-none min-w-0 h-fit min-h-0 pt-4"} sidebarContent={<HTMLBearingDiv className={"p-spacing"} htmlContent={profileData.bio}></HTMLBearingDiv>}></MemoizedSidebar>}
                className={"hidden lg:block md:rounded-none"}
                chevronClassName={"md:hover:rounded-none"}
            >
            </ExpandableDiv>
            </>
        }

        {/* Main content of our profile. Can show user history or edit forms (if the user is the profile's owner)*/}
        <div className="flex">
            <div className="flex-1 w-[75%]">
                <Routes>
                    <Route path="" element={
                        <MemoizedFeedManager
                            key={location.key}
                            deps={profile}
                            validFilters={validFilters}
                            defaultFilter={defaultFilter}
                            validTimeFilters={validTimeFilters}
                            defaultTimeFilter={defaultTimeFilter}
                            hideUserName={true}
                            fetchFeedContent={loadFeedContent}
                            savedFeed={savedFeed}        
                            setSavedFeed={setSavedFeed}
                            onRestore={restoreScrollPos}>
                        </MemoizedFeedManager>
                    }/>

                    {profileData && <Route path="edit" element={<ProfileEditor profileData={profileData} user={user} setProfileData={setProfileData} onLoad={restoreScrollPos}></ProfileEditor>} />}
                </Routes>
            </div>
            {profileData && 
            <div className="lg:hidden mt-10 ml-12 w-[25%]">
                {user && user.toLowerCase() == profile.toLowerCase() && <ProfileControls profile={profileData.username}></ProfileControls>}
                <MemoizedSidebar sidebarContent={<HTMLBearingDiv className={"p-spacing"} htmlContent={profileData.bio}></HTMLBearingDiv>}></MemoizedSidebar>
            </div>}
        </div>
    </div>
    )
}