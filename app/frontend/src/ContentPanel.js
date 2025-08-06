import { useState } from "react";
import { twMerge } from "tailwind-merge";
import React from "react";

export default function ContentPanel({content})
{
    const [activeTab, setActiveTab] = useState(Object.keys(content)[0]);

    return  (
        <div className="w-full">
            <div className="hidden lg:flex justify-center space-x-4 px-4 border-b border-zinc-700 h-12">
                {Object.keys(content).map((key, index, array) => (
                    <>
                        <button className={`px-4 py-2 font-bold ${
                            activeTab === key ? "border-b-4 border-primary1 text-primary1" : "text-slate-700 dark:text-zinc-300"}`
                        }
                        onClick={() => setActiveTab(key)}
                        >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    </>
                ))}
            </div>
    
            <div className="flex">
                {Object.entries(content).map(([key, value]) => {
                    return React.cloneElement(value, {
                        className: twMerge(value.props.className, activeTab == key ? 'lg:block' : 'lg:hidden'),
                      });
                }
                )}
            </div>
        </div>
    )
}
