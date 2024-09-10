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

        messageNotifications: 0,
        setMessageNotifications: (newMessageNotifications) => set({messageNotifications: newMessageNotifications}),
        incrementMessageNotifications: () => set((state) => ({ messageNotifications: state.messageNotifications + 1 })),
        subtractMessageNotifications: (subtrahend) => set((state) => ({ messageNotifications: state.messageNotifications - subtrahend }))
    };
    });