import { useEffect } from "react";
import { useStore } from "../Store";
import CONFIG from "../config"

/*
    Retrieves the saved theme from local storage. Sets the theme to the saved theme.
*/
export const useSavedTheme = () =>
{
    const curTheme = useStore((state) => state.theme);
    const setTheme = useStore((state) => state.setTheme);

    useEffect(() => 
    {
        let newTheme = CONFIG.DEFAULT_THEME;
        const savedTheme = localStorage.getItem("theme");
    
        if(savedTheme)
            newTheme = savedTheme;
    
        if(newTheme != curTheme)
        {
            document.documentElement.classList.add(newTheme);
            setTheme(newTheme);
        }
    }, []);

}

/*
    Returns a setTheme function, which allows us to change and save the current theme.
    Also returns a getTheme function, which allows us to check the current theme.

    return (obj): An object containing two functions:

        setTheme(): Sets and saves a theme
            newTheme (str, required): The new theme to use

        getTheme(): Get the current theme
            return (str): The current theme

*/
export const useTheme = () =>
{
    const curTheme = useStore((state) => state.theme);
    const setNewTheme = useStore((state) => state.setTheme);

    const setTheme = (newTheme) =>
    {   
        localStorage.setItem("theme", newTheme);
        
        let transitionOnToggleElements = document.querySelectorAll(".color-transition");
        transitionOnToggleElements.forEach((transitionElement) =>
        {
            transitionElement.classList.add("transitioning");
            transitionElement.addEventListener('transitionend', () => {
                transitionElement.classList.remove("transitioning");
            })
        })
        document.documentElement.classList.remove(curTheme);
        document.documentElement.classList.add(newTheme);

        setNewTheme(newTheme);
    }

    const getTheme = () =>
    {
        return curTheme;
    }

    return {setTheme, getTheme};
}