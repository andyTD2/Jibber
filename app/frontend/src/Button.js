import { twMerge } from 'tailwind-merge';

/*
    General use Button component

    className (str, optional): optional styling to be applied to button
    type (str, optional): button type (ie., text, submit, reset, etc.)
    value (str, optional): a specified initial value for the button
    handleClick (func, required): function that will be called when button is clicked
    children (ReactNode, optional): content that can be rendered inside the button if provided
    disabled (bool, optional): set to true if button needs to be disabled (non functional)
    theme (str, optional): Name of a theme to be applied. Right now it only supports primary theme
*/
export default function Button({buttonRef, className, type, value, handleClick, children, disabled, theme, showSpinnerOnDisable = true})
{
    let curClassName = "whitespace-nowrap shadow-md dark:text-darkText1 text-lightText1 dark:active:text-darkText3 active:text-lightText3 dark:bg-dark3 bg-light3 dark:hover:bg-dark4 hover:bg-light4 dark:active:bg-dark5 active:bg-light2 flex items-center justify-center px-6 h-9 rounded-full"
    if(theme == "primary")
    {
        curClassName = twMerge(curClassName, "dark:text-primaryText1 text-primaryText1 dark:bg-primary1 bg-primary1 dark:hover:bg-primary1 hover:bg-primary1 dark:active:bg-primary3 active:bg-primary3 dark:active:text-primaryText2 active:text-primaryText2")
    }
    else if (theme == "outlined")
    {
        curClassName = twMerge(curClassName, "border-[3px] border-primary1 dark:text-primaryText1")
    }

    return (
        <button 
            ref={buttonRef}
            disabled={disabled} 
            type={type} 
            value={value} 
            className={twMerge(curClassName, className)} 
            onClick={handleClick}
        >
            {(!disabled || !showSpinnerOnDisable) && children}
            {disabled && showSpinnerOnDisable && <img className="h-6 w-6"src="/spinner-light.svg"></img>}
        </button>
    )
}