/*
    Prevents a function from being called until the timer
    has expired.

    func (func, required): The function to delay
    delayInMs (int, optional, default: 500): Interval for function delay. Uses milliseconds.
*/
export const debounce = (func, delayInMs = 500) =>
{
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delayInMs)
    }
}