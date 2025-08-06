/*
    Purge a cloudflare cache for a given url. This will prevent stale content from being delivered
    from that url.

    urls ([str], required): List of urls to purge
*/
const purgeCacheUrl = async function(urls)
{
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${SECRETS.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${SECRETS.CLOUDFLARE_CACHE_API_TOKEN}`
            },
            body: JSON.stringify({
                "files": urls
            })
        }
    )

    if(!response.ok)
    {
        console.log("Purge cache failed", await response.text());
    }
}

module.exports = {
    purgeCacheUrl
}