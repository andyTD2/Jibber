import CONFIG from "../config"

/*
    Checks if a password abides by our password constraints. The following constraints are enforced:
    1. Must contain at least 1 number
    2. Must contain at least 1 letter
    3. Must contain one of the following characters : !, @, ., _, -
    4. Must match a defined minimum length (see config file)

    password (str, required): The password to validate

    return (obj): An object with the following properties:
        
        isValid (bool): True if password is valid, false otherwise
        error (str): An error if the password is not valid. This is undefined 
            if the password is valid
*/
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

/*
    Given an email, ensures that the email is of the correct format.

    email (str, required): The email to validate

    return (obj): An object with the following properties:

        isValid (bool): True if email is valid, false if not
        error (str): An error, only if the email is invalid
*/
export const validateEmail = function(email)
{
    const emailValidation = /^\S+@\S+\.\S+$/;

    if(!emailValidation.test(email))
    {
        return {isValid: false, error: "Email is not valid"}
    }
    return {isValid: true}
}

/*
    Given a username, ensure it abides by our username constraints, which are:
    1. Username must be a minimum and defined length (see config file)
    2. Must only consist of the alphabet, numbers, underscores, or dashes

    return (obj): An object with the following properties:

        isValid (bool): True if username is valid, false if not
        error (str): An error, only if the username is invalid
*/
export const validateUsername = function(username)
{
    if(username.length < CONFIG.MIN_LENGTH_USER_NAME)
    {
        return {isValid: false, error: "Username is too short"}
    }
    //Regex that checks if username only consists of the alphabet, numbers, underscores and dashes.
    const usernameValidation = new RegExp(`^[a-zA-Z0-9_-]+$`);

    if(!usernameValidation.test(username))
    {
        return {isValid: false, error: "Username must only consist of letters, numbers, underscores, and dashes."}
    }

    return {isValid: true};
}