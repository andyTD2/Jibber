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

        feedContent: undefined,
        setFeedContent: (newFeedContent) => set({feedContent: newFeedContent}),
        replaceContentItem: (newContentItem) => {set(prev => 
        {
            let newFeedContent = [...prev.feedContent]
            for(let i = 0; i < newFeedContent.length; ++i)
            {
                if(newFeedContent[i].id == newContentItem.id)
                {
                    newFeedContent[i] = newContentItem;
                    break;
                }
            }
            return {feedContent: newFeedContent};
        })}
    };
    });