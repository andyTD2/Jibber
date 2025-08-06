"use strict";

require("express-async-errors")
const errors = require(baseDir + "/src/utils/error")
const db = require(baseDir + "/src/utils/db");
const fs = require('fs');
const { JSDOM } = require("jsdom");
const path = require('path');

const getFilter = function(req, res, next) {
    req.filter = req.query.filter || "hot";
    next();
}

/*
    Inject our config file into a script inside index.html. This allows us to access
    a shared config in our frontend.
*/
const injectConfig = function () 
{
    let indexHtml = fs.readFileSync(path.join(__dirname, '../../../frontend/build', 'index.html'), 'utf8');
    const dom = new JSDOM(indexHtml);
    
    const scriptTag = dom.window.document.querySelector('script#config');
    
    // If the script tag exists, inject the config
    if (scriptTag) {
        scriptTag.textContent = `window.JIBBER_CONFIG = ${JSON.stringify(CONFIG)};`;
    }

    return dom.serialize();
}

// Only want to perform the injection once on server init.
const modifiedIndex = injectConfig();

/*
    Stores our modifiedIndex into req.indexHtml, so that any subsequent controllers
    can access it.
*/
const getModifiedIndex = function (req, res, next)
{
    req.modifiedIndex = modifiedIndex || injectConfig();
    next();
}


module.exports = { getFilter, getModifiedIndex };