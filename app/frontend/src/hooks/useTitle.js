import { useEffect } from 'react';

/*
    Used in components to set the document title.

    title (str, required): The title to use.
*/
export const useTitle = (title) => 
{
    useEffect(() => 
    {
        const oldTitle = document.title;
        if(title) document.title = title;

        //Restore title
        return () => document.title = oldTitle;
    }, 
    [title]);
};