require('dotenv').config();
require('dotenv').config({ path: 'settings.env' });

// Non sensitive vars only. Sensitive data (passwords, etc.) should be loaded as environment vars.
// These WILL be seen by the client.
// These values are all required. Defaults are provided where possible.
const configVars = 
{
    "NODE_ENV": "development",
    "BASE_URL": "http://localhost:3000/",
    "API_URL": "http://localhost:3000/api",
    "HOST": "0.0.0.0",
    "PORT": 3000,
    "ITEMS_PER_PAGE": 20,
    "COMMENTS_PER_PAGE": 20,
    "CHILDREN_PER_COMMENT": 5,
    "MAX_LENGTH_PROFILE_DESCRIPTION": 256,
    "MAX_LENGTH_PROFILE_BIO": 10000,
    "MAX_LENGTH_POST_TITLE": 300,
    "MAX_LENGTH_POST_LINK": 10000,
    "MAX_LENGTH_POST_CONTENT": 10000,
    "GENERIC_MAX_LENGTH_LIMIT": 2000,
    "MAX_LENGTH_COMMENT": 5000,
    "MAX_LENGTH_SIDEBAR": 5000,
    "MAX_LENGTH_BOARD_NAME": 30,
    "MAX_LENGTH_BOARD_DESCRIPTION": 500,
    "MAX_LENGTH_BOARD_SIDEBAR": 10000,
    "MAX_LENGTH_SUBSCRIPTIONS_DISPLAY": 5,
    "MAX_LENGTH_POPULAR_BOARDS_DISPLAY": 10,
    "MAX_LENGTH_USER_NAME": 20,
    "MIN_LENGTH_USER_NAME": 3,
    "MAX_LENGTH_PASSWORD": 30,
    "MIN_LENGTH_PASSWORD": 8,
    "MAX_LENGTH_MESSAGE_TITLE": 128,
    "MAX_LENGTH_MESSAGE_BODY": 2500,
    "MAX_LENGTH_EMAIL": 320,
    "MESSAGES_PER_PAGE": 20,
    "VERIFICATION_CODE_LENGTH": 6,
    "MAX_CURRENT_PASSWORD_CODES": 3,
    "MAX_CURRENT_PASSWORD_CODE_ATTEMPTS": 10,
    "PASSWORD_RESET_RATE_LIMIT_DURATION": 20,
    "DEFAULT_PROFILE_PICS": ["black.png", "blue.png", "green.png", "orange.png", "pink.png", "purple.png", "red.png", "yellow.png"],
    "DEFAULT_GROUP_PROFILE_PICS": ["group-black.png", "group-blue.png", "group-green.png", "group-orange.png", "group-pink.png", "group-purple.png", "group-red.png", "group-yellow.png"],
    "DEFAULT_THEME": "dark"
}

// Overwrite any keys defined in the object above with the corresponding environment variable.
for (const key in process.env) {

    //If exists, overwrite
    if (configVars.hasOwnProperty(key)) 
    {
        if (!isNaN(process.env[key])) 
        {
            configVars[key] = Number(process.env[key]);
        } 
        else if (process.env[key].toLowerCase() === "true" || process.env[key].toLowerCase() === "false") 
        {
            configVars[key] = process.env[key].toLowerCase() === "true";
        } 
        else 
        {
            configVars[key] = process.env[key];
        }
    }
}

module.exports = configVars;