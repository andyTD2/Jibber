export const addQueryParams = (baseRoute, queryParams) =>
{
    if(queryParams)
    {
        baseRoute += "?";
        for (const [key, value] of Object.entries(queryParams))
        {
            baseRoute += `${key}=${value}&`
        }
    }
    return baseRoute
}

export const getData = async ({baseRoute, queryParams, onSuccess}) => 
{
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
    method: "GET",
    credentials: 'include'
    });
    console.log("fetching from:", baseRoute);
    if(response.ok)
    {
        let result = (await response.json());
        onSuccess(result);
    }
}

export const postData = async ({baseRoute, queryParams, body, onSuccess}) => 
{
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify(body)
    });

    if(response.ok)
    {
        let results = await response.json(); 
        onSuccess(results)
    }
}