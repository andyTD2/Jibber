import { memo } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export function Banner({className, bannerLink, bannerTitle, bannerDescription, children})
{

    console.log("banner render")

    return (
        <div className={twMerge("bg-zinc-950 rounded-md px-3 pt-3 pb-2", className)}>
            <div className='flex items-center mb-2'>
                <div className='placeholder-avatar rounded-full w-11 h-11 bg-blue-500'></div>
                <Link to={bannerLink}><h1 className='ml-4 text-3xl hover:underline hover:cursor-pointer'>{bannerTitle}</h1></Link>
            </div>
            <h3 className='break-all'>{bannerDescription}</h3>
            <div className='flex mt-3'>{children}</div>
        </div>
    )
}

export const MemoizedBanner = memo(Banner);