import { create } from 'zustand';

/*
    Our "global" state store. These can be accessed and set from anywhere
    within the app.
*/
export const useStore = create((set) => {
    return {
        loginModalIsOpen: false,
        setLoginModalIsOpen: (modalOpened) => set({loginModalIsOpen: modalOpened}),

        signupModalIsOpen: false,
        setSignupModalIsOpen: (modalOpened) => set({signupModalIsOpen: modalOpened}),

        passwordResetModalIsOpen: false,
        setPasswordResetModalIsOpen: (modalOpened) => set({passwordResetModalIsOpen: modalOpened}),

        user: undefined,
        setUser: (newUser) => set({user: newUser}),

        isAdmin: false,
        setIsAdmin: (adminStatus) => set({isAdmin: adminStatus}), 

        profilePicture: undefined,
        setProfilePicture: (newProfilePicture) => set({profilePicture: newProfilePicture}),

        theme: undefined, //default
        setTheme: (newTheme) => set({theme: newTheme}),

        hamburgerMenuOpen: false,
        setHamburgerMenuOpen: (value) =>
            set((state) => ({
              hamburgerMenuOpen: typeof value === "function" ? value(state.hamburgerMenuOpen) : value,
            })),

        subscriptions: {items: [], endOfItems: true},
        setSubscriptions: (newSubscriptions) => set({subscriptions: newSubscriptions}),
        appendSubscriptions: (newSubscriptions) => 
        {
            set(prev => 
            {
                return  {
                            subscriptions: 
                            {
                                endOfItems: newSubscriptions.endOfItems || prev.subscriptions.endOfItems, 
                                items: [...prev.subscriptions.items, ...newSubscriptions.items]
                            }
                        }
            })
        },
        removeSubscription: (subscriptionId) => {
            set(prev =>
            {
                let newItems = [];
                for(let sub of prev.subscriptions.items)
                {
                    if(sub.boardId != subscriptionId)
                    {
                        newItems.push(sub);
                    }
                }
                return  {
                            subscriptions:
                            {
                                endOfItems: prev.subscriptions.endOfItems,
                                items: newItems
                            }
                        };
            }
            )
        },

        messageNotifications: 0,
        setMessageNotifications: (newMessageNotifications) => set({messageNotifications: newMessageNotifications}),
        incrementMessageNotifications: () => set((state) => ({ messageNotifications: state.messageNotifications + 1 })),
        subtractMessageNotifications: (subtrahend) => set((state) => ({ messageNotifications: state.messageNotifications - subtrahend })),

        savedFeed: {},
        setSavedFeed: (updater) => set ((prev) => ({
            savedFeed: typeof updater === 'function' ? updater(prev.savedFeed) : updater
        }))
    };
    });