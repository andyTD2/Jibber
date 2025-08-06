import { memo } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';


/*
    This component displays a large banner. Typically used to display 
    profiles(avatar, username, description), board, etc.

    className (str, optional): optional/additional styling
    bannerLink (str, required): relative link that the user will be redirected to when the title is clicked
    bannerTitle (str, optional): title/main heading of the banner
    bannerDescription (str, optional): description/subtitle that will be displayed under the title
    bannerPictureLink (str, required): src link of the banner picture
    children (ReactNode, optional): any react component that will be rendered in the banner's footer
*/
export function Banner({className, titleClassName, bannerLink, bannerTitle, bannerDescription, children, bannerPictureLink})
{
    return (
        <div className={twMerge("dark:bg-dark1 bg-light1 color-transition lg:shadow-none shadow-xl rounded-md sm:rounded-none pt-3 pb-2 rounded-t-none", className)}>
            <div className='flex items-center overflow-x-scroll scrollbar-hide px-3 py-2'>
                {bannerPictureLink && <img className='rounded-full min-h-11 min-w-11 w-11 h-11 object-cover shadow-light dark:shadow-lightShadow-light' src={bannerPictureLink}></img>}
                {bannerLink && <Link to={bannerLink}><h1 className={twMerge('text-lightText1 dark:text-darkText1 ml-4 font-bold text-3xl hover:underline hover:cursor-pointer', titleClassName)}>{bannerTitle}</h1></Link>}
                {!bannerLink && <h1 className={twMerge('text-lightText1 dark:text-darkText1 ml-4 font-bold text-3xl', titleClassName)}>{bannerTitle}</h1>}
            </div>
            {bannerDescription && <h3 className='break-words text-lightText1 dark:text-darkText1 px-3 xxs:text-sm text-base'>{bannerDescription}</h3>}
            <div className='flex flex-wrap mt-3 px-3'>{children}</div>
        </div>
    )
}

export const MemoizedBanner = memo(Banner);