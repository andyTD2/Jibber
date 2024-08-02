import { memo } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export function Banner({className, bannerLink, bannerTitle, bannerDescription})
{

    console.log("banner render")

    return (
        <div className={`${twMerge("w-full", className)}`}>
            <div className="bg-zinc-950 rounded-md rounded-bl-none p-3">
                <div className='flex items-center mb-2'>
                    <div className='placeholder-avatar rounded-full w-11 h-11 bg-blue-500'></div>
                    <Link to={bannerLink}><h1 className='ml-4 text-3xl hover:underline hover:cursor-pointer'>{bannerTitle}</h1></Link>
                </div>
                <h3>{bannerDescription}</h3>
            </div>
        </div>
    )
}

export const MemoizedBanner = memo(Banner);