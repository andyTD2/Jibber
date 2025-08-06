import { useStore } from "./Store";
import { twMerge } from "tailwind-merge";

import Button from "./Button";

export default function SignIn({className, buttonClassName, children, text = "Log In"})
{
    const user = useStore((state) => state.user);
    const setLoginModalVisibility = useStore((state) => state.setLoginModalIsOpen);

    if (user)
        return null;

    return (
        <div className={twMerge("flex items-center hover:cursor-pointer px-2", className)}>
            <Button handleClick={() => setLoginModalVisibility(true)} className={twMerge("h-8", buttonClassName)} theme="primary">{children}{text}</Button>
        </div>
    )
}