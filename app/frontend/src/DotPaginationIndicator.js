import { twMerge } from "tailwind-merge";

/*
    This component uses dot pagination to indicate the current and total number of pages.
    Typically used in a multi step modal

    numPages (int, optional, default: 0): Total number of pages
    curPage (int, required): The current page
    className (str, optional): Optional/additional styling to be applied
*/

export default function DotPaginationIndicator({numPages = 0, curPage, className})
{
    return (
        <div className={twMerge('flex gap-1', className)}>
            {
                Array.from({length: numPages}).map((_, index) => 
                index == curPage ? <div className="h-[6px] w-[6px] rounded-full dark:bg-white bg-black" />
                :
                index != curPage && <div className="h-[6px] w-[6px] rounded-full dark:bg-zinc-500 bg-zinc-300" />
                )
            }
        </div>
    )
}