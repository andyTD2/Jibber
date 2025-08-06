import { useEffect, useRef, useState } from "react";
import { debounce } from "../utils/debounce";
import { getFirstScrollableParent } from "../utils/getFirstScrollableParent";

export const useScrolledToBottom = ({onScrolledToBottom, delay = 250, offset = 0}) => {
    const ref = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const scrollableParent = getFirstScrollableParent(element);

        const debouncedHandleScroll = debounce(async () => 
        {
            if(isScrolled)
                return;

            const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
            if (Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1 + offset) {
                setIsScrolled(true)
                await onScrolledToBottom();
                setIsScrolled(false);
            }
        }, delay);

        scrollableParent.addEventListener("scroll", debouncedHandleScroll);

        return () => {
            scrollableParent.removeEventListener("scroll", debouncedHandleScroll);
        };

    }, [onScrolledToBottom, ref]);

    return ref;
};
