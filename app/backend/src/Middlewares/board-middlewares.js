"use strict";

const boardModel = require(baseDir +"/src/Models/board-model");
const userModel = require(baseDir + "/src/Models/user-model");
const userServices = require(baseDir + "/src/Services/user-service");

/*
    Retrieves board data, and stores it into req.board, where it can be accessed
    by any subsequent functions.

    - param args:
        board (str, required): Name of the board to retrieve data from

*/
const loadBoardData = async function(req, res, next) {
    req.board = req.params.board;

    //Retrives board data from db
    const result = await boardModel.getBoardData({boardName: req.board});
    if(!result)
    {
        req.boardData = undefined;
        return;
    }
    
    //Store some(not all) of the data returned by getBoardData()
    req.boardData = 
    {
        id: result.id,
        title: result.title,
        description: result.description,
        sidebar: result.sidebar,
        numSubscribers: result.numSubscribers,
        postCount: result.postCount,
        createdAt: result.createdAt,
        boardPicture: result.boardPicture,
        deleted: result.deleted
    }
    next();
}

/*
    Checks if a user is an appointed moderator for a board. Requires active user session.
    Stores result in req.moderator.
*/
const getModeratorAuthStatus = async function(req, res, next)
{
    if(!req.session.userID) 
        req.moderator = false;
    else
    {
        //Check if user has moderation privledges for this board
        const status = await userServices.checkUserPerms({userId: req.session.userID, requestedPerm: "MODERATION", boardScopeId: req.boardData.id})

        req.moderator = status.ok;
    }
    if(next) next();
}

/*
    Checks if a user has moderator privledges. If not, denies access to the route.
*/
const requireModeratorPrivledges = async function(req, res, next)
{
    //If moderator status hasn't been determined yet, check it.
    if(req.moderator == undefined)
        await getModeratorAuthStatus(req, res);

    if(req.moderator == false)
    {
        res.status(401).send({error: "You don't have the permissions to access this."});
        return;
    }

    return next();
}

/*
    Checks if a user has permissions to use a board. All users except banned ones should
    have this privledge.

    Note req.boardData needs to be retrieved by loadBoardData() first
*/
const requireBoardPrivledges = async function(req, res, next)
{
    if(req.boardData.deleted)
    {
        res.status(403).send({error: "This board has been deleted."});
        return;
    }

    const userBans = await userModel.getUserBans(
        {userToCheckId: req.session.userID, boardId: req.boardData.id})

    if(userBans.length > 0)
    {
        res.status(403).send({error: `This account has been banned from ${req.boardData.title}`});
        return;
    }

    next();
}

module.exports = {requireBoardPrivledges, loadBoardData, getModeratorAuthStatus, requireModeratorPrivledges};