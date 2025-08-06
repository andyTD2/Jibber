"use strict"

const errors = require(baseDir + "/src/utils/error");
const db = require(baseDir + "/src/utils/db");
const dbCon = db.pool;
const mysql = db.mysql;
const queryDb = db.queryDb;

const EPOCH = new Date(1970, 0, 1);
const DEPLOY_DATE = new Date(2023, 6, 1);
const DEPLOY_DATE_TIMESTAMP_SECONDS = DEPLOY_DATE.getTime() / 1000;

/*
    Calculates time difference between a given date and the EPOCH start, in seconds.

    dateSinceEpochStart (date): Date to get difference of.

    returns (int): The absolute difference, in seconds, since epoch start.
*/
function getEpochDiff(dateSinceEpochStart)
{
    return Math.abs(dateSinceEpochStart - EPOCH) / 1000;
}

/*
    Calculates a rank given a vote amount and date created. Larger vote shares
    increase the rank, as well as newer dates.

    voteSum (int, required): Vote/score of the item being ranked
    dateCreated (date, required): Creation date of the item being ranked

    returns (int): Item score
*/
const calculateRank = function(voteSum, dateCreated) 
{
    let order = Math.log10(Math.max(Math.abs(voteSum), 1));
    let sign;

    if (voteSum > 0)
    {
        sign = 1;
    }
    else if (voteSum < 0)
    {
        sign = -1;
    }
    else
    {
        sign = 0;
    }

    let seconds = getEpochDiff(dateCreated) - DEPLOY_DATE_TIMESTAMP_SECONDS;
    return (sign * order + seconds / 45000).toFixed(7);
}
module.exports = {calculateRank};