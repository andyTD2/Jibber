import {memo, useEffect} from "react";

export function Test(props) 
{
    useEffect(() => console.log("test remount"), []);
    return (
        <div>
            {props.test}
        </div>
    )
}

export const MemoizedTest = memo(Test);