/*
    Finds the first ancestor element that is scrollable.

    element (html): Html element

    returns (html): Parent element that is scrollable
*/

export const getFirstScrollableParent = (element) => {
    if (!element) return null;

    let parent = element.parentElement;
    while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;

        if (overflowY === "auto" || overflowY === "scroll") //container is scrollable
        {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}