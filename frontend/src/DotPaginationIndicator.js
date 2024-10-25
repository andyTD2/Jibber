import { twMerge } from "tailwind-merge";

export default function DotPaginationIndicator({numPages = 0, curPage, className})
{
    return (
        <div className={twMerge('flex gap-1', className)}>
            {
                Array.from({length: numPages}).map((_, index) => 
                index == curPage ? <div className="h-[6px] w-[6px] rounded-full bg-white" />
                :
                index != curPage && <div className="h-[6px] w-[6px] rounded-full bg-zinc-500" />
                )
            }
        </div>
    )
}