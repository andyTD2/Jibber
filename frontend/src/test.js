import {memo} from "react";

export function Test(props) 
{
    console.log("test render");
    return (
        <div>
            {props.test}
        </div>
    )
}

export const MemoizedTest = memo(Test);