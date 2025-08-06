import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { useScrolledToBottom } from "./hooks/useScrolledToBottom";

export default function ShowMore({onShowMore, disabled, className})
{
    const scrollRef = useScrolledToBottom({onScrolledToBottom: onShowMore, offset: 1000});

    return (
        <Button 
        handleClick={onShowMore}
        buttonRef={scrollRef}
        className={twMerge("w-full bg-light1 hover:bg-light2 active:bg-light4 mb-2", className)}
        disabled={disabled}
        >
        SHOW MORE
        </Button>
    )
}