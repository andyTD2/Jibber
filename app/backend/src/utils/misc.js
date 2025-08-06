const { sanitizeHtml } = require(baseDir + "/src/utils/sanitize");
const { decode } = require('html-entities');

const JSDOM = require("jsdom").JSDOM;
const fs = require('fs');

/*
    Ensures a given offset is an integer. Invalid values will result in a returned value of 0

    offset (int): The offset to parse

    returns (int): The parsed offset, or 0 if offset isn't valid.
*/
const parseOffset = function(offset)
{
    return offset ? parseInt(offset) : 0
}

/*
    Validates a filter against an object containing valid filters.

    filter (str, required): Filter to validate
    defaultFilter (str, required): The filter to use if "filter" isn't valid.
    validFilters (obj, required): The filter object to validate against.

    returns (str): The value of the corresponding filter key.
*/
const getFilterQuery = function(filter, defaultFilter, validFilters)
{
    if(!filter) filter = defaultFilter; //default filter

    let orderBy = validFilters[filter];
    if(!orderBy) orderBy = validFilters[defaultFilter];
    return orderBy;
}

/*
    Checks if URL is valid.

    url (str, required): The url to check

    returns (bool): True if url is valid.
*/
const isValidUrl = function(url)
{
    if(url.length)

    try {
        const checkUrl = new URL(url);
        return true;
    } catch(err) {
        return false;
    }
}

/*
    Fetches a js dom for a url.

    url (str, required): url to fetch.

    returns (JSDOM): JSDOM for the url
*/
const getHtml = async function(url)
{
    const response = await fetch(url);
    if(!response.ok)
    {
        return {error: true, statusCode: response.status}
    }

    let html = await response.text();
    return new JSDOM(html);
}

/*
    Given a dom, fetches the og:title meta tag content, which is typically
    the title of the article.

    dom (dom): JSDOM of the webpage

    returns (str): The title of the article, if it exists.
*/
const getArticleTitle = function(dom)
{
    const titleTag = dom.window.document.querySelector("meta[property='og:title'");
    if(titleTag) return titleTag.getAttribute("content");

    return undefined;
}

/*
    Given a dom, fetches the og:image meta tag content, which is typically
    the main image of the article.

    dom (dom): JSDOM of the webpage
*/
const getArticleImageSrc = function(dom)
{
    const imgTag = dom.window.document.querySelector("meta[property='og:image']");
    if(imgTag) return imgTag.getAttribute("content");

    return undefined;
}

function getHttpsCredentials() {
    return {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
        passphrase: CONFIG.HTTPS_CERTIFICATE_PASSWORD
    };
}

/*
    Given an HTML string, returns the decoded character count. HTML tags are not included in the count.

    str (str): string to count

    returns (int): Character count of the string
*/
function getDecodedHtmlLength(str) {

    //Remove all HTML tags with sanitize
    let commentWithNoHtml = sanitizeHtml({content: str, allowedTags: []});
    commentWithNoHtml = decode(commentWithNoHtml);

    return commentWithNoHtml.length;
}


module.exports = {isValidUrl, getHtml, getArticleTitle, getArticleImageSrc, getFilterQuery,
                    parseOffset, getHttpsCredentials, getDecodedHtmlLength
};