require('dotenv').config();
require('dotenv').config({ path: 'settings.env' });

// Sensitive data. All of these are required.
// Though you can manually add the required data here, I strongly recommend
// you provide it via environment variables. ENV vars will be loaded into this object.
const secrets = 
{
    //These values are used to connect to DB
    "MYSQL_DATABASE": '',
    "MYSQL_HOST": '',
    "MYSQL_PORT": undefined,
    "MYSQL_USER": '',
    "MYSQL_PASSWORD": '',

    //For verification emails (ex: test.dev)
	"EMAIL_DOMAIN": '',
    "EMAIL_ACCOUNT": '',
    "EMAIL_APP_PASSWORD": '',

    //R2 bucket for image storage
    "R2_URL": '',
	"R2_BUCKET_NAME": '',
    "R2_ACCESS_KEY": '',
    "R2_SECRET_ACCESS_KEY": '',
    "R2_ENDPOINT": '',

    //Used so sign sessions. Use a secret, random value
    "SESSION_STORE_SECRET": '',

    //Value used to purge cloudflare CDN caches for specific files(refreshes profile pics on upload)
    "CLOUDFLARE_CACHE_API_TOKEN": '',
    "CLOUDFLARE_ZONE_ID": '',

    "TRUST_ALL_PROXY": undefined,
    "TRUST_PROXY": undefined
}

// Overwrite any keys defined in the object above with the corresponding environment variable.
for (const key in process.env) {

    //If exists, overwrite
    if (secrets.hasOwnProperty(key)) 
    {
        if (!isNaN(process.env[key])) 
        {
            secrets[key] = Number(process.env[key]);
        } 
        else if (process.env[key].toLowerCase() === "true" || process.env[key].toLowerCase() === "false") 
        {
            secrets[key] = process.env[key].toLowerCase() === "true";
        } 
        else 
        {
            secrets[key] = process.env[key];
        }
    }
}

module.exports = secrets;