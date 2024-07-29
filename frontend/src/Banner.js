import { memo } from 'react';
import { Link } from 'react-router-dom';

export function Banner(props)
{

    console.log("banner render", props)

    return (
        <div className='w-full'>
            <div className="bg-zinc-950 rounded-md rounded-bl-none p-3">
                <div className='flex items-center mb-2'>
                    <div className='placeholder-avatar rounded-full w-11 h-11 bg-blue-500'></div>
                    <Link to={props.bannerLink}><h1 className='ml-4 text-3xl hover:underline hover:cursor-pointer'>{props.bannerTitle}</h1></Link>
                </div>
                <h3>{props.bannerDescription}</h3>
            </div>
        </div>
    )
}

export const MemoizedBanner = memo(Banner);