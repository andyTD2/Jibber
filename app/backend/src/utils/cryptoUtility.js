const crypto = require("crypto");

/*
    Generates a random string of given length.

    length (int, required): Length of the random string to generate

    returns (str): The random string
*/
const generateRandomString = (length) => 
{
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        result += characters[randomIndex];
    }
    return result;
}

module.exports = {
    generateRandomString
}