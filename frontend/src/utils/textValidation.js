import CONFIG from "../config.json"

export const validatePassword = function(password)
{
    //RegEx that checks for at least one number
    const atLeastOneNum = new RegExp(".*[0-9].*");
    if(!atLeastOneNum.test(password))
    {
        return {isValid: false, error: "Password must have at least one number"};
    }

    //RegEx that checks for at least one letter
    const atLeastOneAlpha = new RegExp(".*[a-zA-Z].*");
    if(!atLeastOneAlpha.test(password))
    {
        return {isValid: false, error: "Password must contain at least one letter"}
    }

    //RegEx that checks for at least one of the following: [!, @, ., _, -]
    const atLeastOneSpecial = new RegExp(".*[!@._-].*");
    if(!atLeastOneSpecial.test(password))
    {
        return {isValid: false, error: "Password must contain one of the following: !@._-"}
    }

    if(password.length < CONFIG.MIN_LENGTH_PASSWORD)
    {
        return {isValid: false, error: "Password too short!"}
    }

    return {isValid: true};
}


export const validateEmail = function(email)
{
    const emailValidation = /^\S+@\S+\.\S+$/;

    if(!emailValidation.test(email))
    {
        return {isValid: false, error: "Email is not valid"}
    }
    return {isValid: true}
}

export const validateUsername = function(username)
{
    if(username.length < CONFIG.MIN_LENGTH_USER_NAME)
    {
        return {isValid: false, error: "Username is too short"}
    }
    //RegEx that checks if username is between 3 and 20 characters long, 
    //and only consists of the alphabet, numbers, underscores and dashes.
    const usernameValidation = new RegExp(`^[a-zA-Z0-9_-]+$`);

    if(!usernameValidation.test(username))
    {
        return {isValid: false, error: "Username must only consist of letters, numbers, underscores, and dashes."}
    }

    return {isValid: true};
}