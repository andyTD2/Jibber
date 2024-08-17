import { create } from 'zustand';


export const useStore = create((set) => {
    return {
        loginModalIsOpen: false,
        setLoginModalIsOpen: (modalOpened) => set({loginModalIsOpen: modalOpened}),

        signupModalIsOpen: false,
        setSignupModalIsOpen: (modalOpened) => set({signupModalIsOpen: modalOpened}),

        user: undefined,
        setUser: (newUser) => set({user: newUser}),

        theme: "dark", //default
        setTheme: (newTheme) => set({theme: newTheme}),

        post: undefined,
        setPost: (newPost) => set({post: newPost}),

        feedContent: [],
        setFeedContent: (newFeedContent) => set({feedContent: newFeedContent}),
        appendFeedContent: (newFeedContent) => set(prev => ({feedContent: [...prev.feedContent, ...newFeedContent]})),
        setContentItemInFeed: (contentId, contentItemChanges) => {set(prev => 
        {
            let newFeedContent = [...prev.feedContent]
            for(let i = 0; i < newFeedContent.length; ++i)
            {
                if(newFeedContent[i].id == contentId)
                {
                    const newContentItem = Object.assign({}, newFeedContent[i], contentItemChanges);
                    newFeedContent[i] = newContentItem;
                    break;
                }
            }
            return {feedContent: newFeedContent}
        })}
    };
    });