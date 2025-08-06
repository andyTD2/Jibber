
const db = require("mysql2/promise");

const options = {
    host: SECRETS.MYSQL_HOST || '127.0.0.1',
    port: SECRETS.MYSQL_PORT || 3306,
    user: SECRETS.MYSQL_USER,
    password: SECRETS.MYSQL_PASSWORD,
    database: SECRETS.MYSQL_DATABASE
}

let newPool = db.createPool(options);

if (!newPool)
{
    throw new error("Failed to connect do DB");
}

/*
    Query the database using formatted parameters.

    sql (str, required): The base sql statement, with formatted parameter placeholders.
    params ([var], optional): An array of variables that will replace the parameter placeholders.
    printQuery (bool, optional, default: false): Set to true to print the query for debugging purposes.
*/
const queryDb = async function(sql, params, printQuery=false)
{
    let query = params ? db.format(sql, params) : sql;

    if(printQuery)
        console.log(query);
    
    let result = await newPool.query(query);
    return result[0];
}


module.exports = {
    pool: newPool,
    mysql: db,
    options: options,
    queryDb
}