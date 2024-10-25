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
    console.log(queryParams);
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
    method: "GET",
    credentials: 'include'
    });
    console.log("fetching from:", baseRoute);
    if(response.ok)
    {
        let result = (await response.json());
        console.log("res", result);
        onSuccess(result);
    }
}

export const postData = async ({baseRoute, queryParams, body, onSuccess, onFailure, headers = { "Content-Type" : "application/json"}}) => 
{
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
        method: "POST",
        credentials: 'include',
        headers,
        body: JSON.stringify(body)
    });

    console.log(response);
    const data = await response.json();

    if(response.ok)
    {
        if(onSuccess) onSuccess(data)
    }
    else
    {
        if(onFailure) onFailure(data)
    }
}