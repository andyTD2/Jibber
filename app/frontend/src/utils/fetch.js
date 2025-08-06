
/*
    Encodes query params into a url.

    baseRoute (str, required): Base url route (ie., www.google.com)
    queryParams (obj, required): Object containing the key-value query params
        Example:

        {
            "sort" : "new"
            "page": 2
        }

    return (str): The url with query params encoded
*/
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

/*
    Send a GET request to a URL. Upon success, call the onSuccess function
    with the server response as the argument.

    baseRoute (str, required): BASE route (without params) to send request to

    queryParams (obj, optional): queryParams to attach to the base route, in the form of an object
        Example:

        {
            "sort" : "new"
            "page": 2
        }

    onSuccess (func, required): Callback that is triggered on successful GET. This function
        will be provided the server response as it's only argument
*/
export const getData = async ({baseRoute, queryParams, onSuccess, onFailure}) => 
{
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
    method: "GET",
    credentials: 'include'
    });

    if(response.ok)
    {
        let result = (await response.json());
        if(onSuccess) onSuccess(result);
    }
    else
    {
        if(onFailure) onFailure(await response.json());
    }
}

/*
    Send a POST request to a URL. Upon success, call the onSuccess function
    with the server response as the argument. On failure, calls a failure callback.

    baseRoute (str, required): BASE route (without params) to send request to

    queryParams (obj, optional): queryParams to attach to the base route, in the form of an object
        Example:

        {
            "sort" : "new"
            "page": 2
        }

    body (obj, optional): Data to attach to the POST request body. Example:
        {
            "dataKey": "dataValue"
        }

    onSuccess (func, required): Callback that is triggered on successful GET. This function
        will be provided the server response as it's only argument

    onFailure (func, required): Callback that is triggered on failure. Will be called with
        the server's response as its argument
    
    headers (obj, optional): additional headers to attach
*/
export const postData = async ({baseRoute, queryParams, body, onSuccess, onFailure, headers = { "Content-Type" : "application/json"}}) => 
{
    baseRoute = addQueryParams(baseRoute, queryParams);

    const response = await fetch(baseRoute, {
        method: "POST",
        credentials: 'include',
        headers,
        body: JSON.stringify(body)
    });

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