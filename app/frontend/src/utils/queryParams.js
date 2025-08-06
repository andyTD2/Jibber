
/*
    Given a valid filter object and a filter selection, check if the 
    valid filters object contains the selection. If so, return the 
    selection. Otherwise, returned undefined.

    filter (str, required): The filter selection to check

    validFilters (obj, required): The valid filters object to check against.
        The key in the object is the filter keyword, and the value is the 
        display text of the filter. Format is as follows:

        {
            "new": "New",
            "numscore": "Top"
        }

    return (str): Returns the filter in lowercase if it is valid, otherwise undefined
*/
export const validateFilter = (filter, validFilters) =>
{
    let formattedFilter = filter;
    if(formattedFilter && validFilters)
    {
        formattedFilter = formattedFilter.toLowerCase();
        if(formattedFilter in validFilters)
        {
            return formattedFilter;
        }
    }
    return undefined;
}

/*
    For pagination, our server expects an offset. For example, if the client has 20 comments loaded,
    and wants the next 20, we need to pass an offset of 20 to let the client know where to begin 
    loading comments. But for user convienence, we allow navigation via pages (ie., go to page 2, 
    where each page contains X amount of content items). This function calculates the correct offset 
    based on the page.

    page (int, required): the current page to calculate offset from

    commentsPerPage (int, required): How many comments(or posts, or other items) per page.

    returns (int): The correct offset based on current page
*/
export const getOffsetFromPage = (page, commentsPerPage) =>
{
    if(!isNaN(page) && page != null)
        return Math.max(0, (parseInt(page) - 1) * commentsPerPage);
    else
        return 0;
}