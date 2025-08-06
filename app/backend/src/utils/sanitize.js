const defaultSanitizeHtml = require("sanitize-html");

const sanitizeHtml = ({content, allowedTags = defaultSanitizeHtml.defaults.allowedTags, removedTags = []}) => {
    allowedTags = allowedTags.filter(tag => !removedTags.includes(tag));
    const allowedAttributes = {...defaultSanitizeHtml.defaults.allowedAttributes, "*": ["style"]};
    const allowedStyles = {"*": {'text-align': [/^left$/, /^right$/, /^center$/]}}

    let sanitizedContent = defaultSanitizeHtml(content, {allowedTags, allowedAttributes, allowedStyles});
    return sanitizedContent.trim();
}

module.exports = {sanitizeHtml};