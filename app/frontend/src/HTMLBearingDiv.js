import defaultSanitizeHtml from 'sanitize-html';
import { twMerge } from 'tailwind-merge';


/*
    Small santizeHtml wrapper that modifies allowed tags, attributes, and styles.

    content (html, required): Content to be sanitized
    tagWhitelist ([str], required): List of tags to allow

    returns (html): Sanitized html
*/
const sanitizeHtml = ({content, tagWhitelist = []}) => {
    const allowedAttributes = {...defaultSanitizeHtml.defaults.allowedAttributes, "*": ["style"]};
    const allowedTags = [...defaultSanitizeHtml.defaults.allowedTags, ...tagWhitelist]

    let sanitizedContent = defaultSanitizeHtml(content, {allowedAttributes, allowedTags, parseStyleAttributes: false});
    return sanitizedContent.trim();
}



/*
    This component sanitizes any HTML, then renders it inside a div.

    htmlContent (html, required): htmlContent that should be sanitized then rendered
    className (str, optional): optional/additional styling
*/

export default function HTMLBearingDiv({htmlContent, className, sanitize=true, tagWhitelist = []})
{
    let sanitizedHtml = sanitize ? sanitizeHtml({content: htmlContent, tagWhitelist}) : htmlContent;

    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml}} className={twMerge("[&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc", className)}></div>
}