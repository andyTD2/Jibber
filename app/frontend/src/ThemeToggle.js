import ToggleButton from "./ToggleButton";
import { useTheme } from "./hooks/useTheme";
import { twMerge } from "tailwind-merge";

/*
    Component that lets users toggle the current theme

    className (str, optional): optional styling
*/
export default function ThemeToggle({className, toggleSwitchClassName})
{
    const {getTheme, setTheme} = useTheme();

    /*
        Gets the current theme, then toggles the opposite
    */
    const handleToggle = () =>
    {
        getTheme() != "dark" ? setTheme("dark") : setTheme("light")
    }

    return (
        <div className={twMerge("hover:bg-altlight3 dark:hover:bg-dark3 hover:cursor-pointer px-4 flex items-center h-12", className)} onClick={handleToggle}>
            <div className={twMerge("mr-2 w-8", toggleSwitchClassName)}>
                <ToggleButton enabled={getTheme() != "dark"}></ToggleButton>
            </div>
            Dark Mode
        </div>
    )
}