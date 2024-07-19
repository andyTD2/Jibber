
/*
*/
export const validateFilter = (filter, validFilters) =>
{
    let formattedFilter = filter;
    if(formattedFilter)
    {
        formattedFilter = formattedFilter.toLowerCase();
        if(validFilters.has(formattedFilter))
        {
            return formattedFilter;
        }
    }
    return undefined;
}

export const getOffsetFromPage = (page, commentsPerPage) =>
{
    if(!isNaN(page) && page != null)
        return Math.max(0, (parseInt(page) - 1) * commentsPerPage);
    else
        return 0;
}