import { twMerge } from "tailwind-merge";

/*
    Small, generic text input

    type (str, optional): Type of input(text, button, date, etc.)
    id (str, optional): ID for the input element
    name (str, optional): name for the input element
    placeholder (str, optional): placeholder for the input element
    maxLength (str, optional): max length for the input element
    value (str, optional): value for the input element
    onChange(func, optional): Callback function that is triggered when there is a change in the input element
    className(str, optional): optional styling
*/
export default function TextInputSmallRound(props) {

    return (
        <input type={props.type || "text"} id={props.id} name={props.name} placeholder={props.placeholder} maxLength={props.maxLength}
        value={props.value} onChange={props.onChange}
        className={twMerge(`
            shadow-md text-center focus:outline-none p-3 h-9 leading-9 w-56 rounded-xl

            dark:bg-dark3
            bg-light2

            dark:text-darkText1
            text-lightText1

            dark:hover:bg-dark4
            hover:bg-light3

            dark:focus:bg-dark5
            focus:bg-light4
            `
        , props.className)}
        />
    )
}