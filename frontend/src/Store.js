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
        setTheme: (newTheme) => set({theme: newTheme})
    };
    });