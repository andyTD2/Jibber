import sanitizeHtml from 'sanitize-html';
import { twMerge } from 'tailwind-merge';


export default function HTMLBearingDiv({htmlContent, className})
{
    const sanitizedHtml = sanitizeHtml(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml}} className={twMerge("[&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:ml-6 [&_ul]:list-disc", className)}></div>
}