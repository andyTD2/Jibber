"use strict";

require("express-async-errors")
const errors = require(baseDir + "/src/utils/error")

const boardService = require(baseDir + "/src/Services/board-service");

/*
    Handles requests for creating new boards.

    - requires active user session
    - body args:
        boardName (str, required): Name of the new board to be created
        boardDescription (str, required): Description of the new board to be created
        boardSidebar (str, required): Sidebar description of the new board to be created
*/
const handleNewBoardRequest = async function(req, res)
{
    let newBoard = await boardService.createBoard(req.body.boardName, req.body.boardDescription, req.body.boardSidebar, req.session.userID);
    if(!newBoard.ok)
    {
        res.status(newBoard.statusCode).send({error: newBoard.error});
        return;
    }

    res.status(200).send({status: "success", boardName: req.body.boardName});
}


/*
    Handles requests for board edits to descriptions or sidebars.

    - requires active user session
    - requires moderator privledges
    - requires valid board data
    - (see middlewares for above requirements)

    - body args:
        boardDescription (str, required): New description
        boardSidebar (str, required): New sidebar description

*/
const handleEditBoardRequest = async function(req, res)
{
    if(!req.boardData)
    {
        res.status(400).send({error: "Invalid board"});
        return;
    }

    let edit = await boardService.editBoard(req.body.boardDescription, req.body.boardSidebar, req.boardData.id);

    if(!edit.ok)
    {
        res.status(edit.statusCode).send({error: edit.error});
        return;
    }

    res.status(200).send(edit.data);
}

/*
    Handles requests for fetching post feeds for a board

    - boardData is optional(frontpage if no board data). See middlewares for more information
    - user session is optional, but required if the user wants to see their current vote

    - queryParam args:
        t (str, optional): Filter by time
        filter (str, optional, default: "hot"): Feed filter category (top, new, etc.)
        lastSeen (int, optional): The last post that was seen/loaded. Necessary when sorting by new
        offset (int, optional): When fetching a certain page of the feed, offset denotes how many posts to skip
*/
const handleBoardFeedRequest = async function(req, res) {
    let queryBoardFeed = await boardService.getBoardPosts({boardData: req.boardData, timeFilter: req.query.t, filter: req.query.filter, lastSeen: req.query.lastSeen, offset: req.query.offset, userId: req.session.userID});
    if (!queryBoardFeed.ok)
    {
        res.status(queryBoardFeed.statusCode).send(queryBoardFeed.error);
        return;
    }
    res.status(200).send(queryBoardFeed.data);
}


/*
    Handles requests for fetching board meta data(title, description, numSubscribers, modStatus, etc.)

    - boardData is required. Should be retrieved by a middleware.
    - user session is optional, but necessary to view subscription status
*/
const handleBoardRequest = async function(req, res) {
    let queryBoard = await boardService.getBoard(req.boardData, req.session.userID);
    if (!queryBoard.ok)
    {
        res.status(queryBoard.statusCode).send(queryBoard.error);
        return;
    }
    queryBoard.data.moderator = req.moderator;

    res.status(200).send(queryBoard.data);
}

/*
    Handles requests for board search queries

    - queryParam args:
        q (str, required): Query text to match results against
        offset (int, optional, default: 0): The amount of results to skip. Used for pagination
*/
const handleBoardSearchRequest = async function(req, res) 
{
    let queryResults = await boardService.queryBoards(req.query.q, req.query.offset);
    if(!queryResults.ok)
    {
        res.status(queryResults.statusCode).send(queryResults.error);
        return;
    }

    res.status(200).send(queryResults.data);
}

/*
    Handles requests for fetching a list of popular boards.
*/
const handlePopularBoardsRequest = async function(req, res)
{
    let results = await boardService.getPopularBoards();
    if(!results.ok)
    {
        res.status(results.statusCode).send(results.error);
        return;
    }

    res.status(200).send(results.data);
}

/*
    Handles requests for presigned urls which allow authenticated users to upload/change 
    the board's profile picture

    - requires active user session with moderator privledges
    - requires valid boardData
    - see corresponding middlewares for more information

    - body args:
        fileSize (int, required): Filesize in bytes, 10,000,000(10MB) is the max
        fileExtension (str, required): Extension of the uploaded file. Supports "png" and "jpg".
*/
const handleBoardPicPresignedUrlRequest = async function(req, res)
{
    const presignedURLRequest = await boardService.getBoardPicUploadURL(req.body.fileSize, req.body.fileExtension, req.boardData.id);
    if(!presignedURLRequest.ok)
    {
        res.status(presignedURLRequest.statusCode).send(presignedURLRequest.error);
        return;
    }

    res.status(200).send({status: "OK", data: presignedURLRequest});
}

/*
    Handles requests to confirm picture uploads. This will purge cloudflare related caches.

    - requires valid boardData (see middlewares)

    - body args:
        fileExtension (str, required): Extension of the uploaded file. Supports "png" and "jpg".
*/
const handleBoardPicUploadConfirmationRequest = async function(req, res)
{
    const confirmUploadRequest = await boardService.confirmBoardPicUpload(req.boardData.id, req.body.fileExtension);
    if(!confirmUploadRequest.ok)
    {
        res.status(confirmUploadRequest.statusCode).send(confirmUploadRequest.error);
        return;
    }

    res.status(200).send({url: confirmUploadRequest.url});
    
}

/*
    Handles requests for retrieving the system/frontpage message.
*/
const handleSystemMessageRequest = async function(req, res)
{
    const systemMessageRequest = await boardService.getSystemMessage();
    if(!systemMessageRequest.ok)
    {
        res.status(systemMessageRequest.statusCode).send(systemMessageRequest.error)
        return;
    }
    res.status(200).send({systemMessage: systemMessageRequest.systemMessage});
}


/*
    Deletes a specific board.
    - requires active user session
    - requires "SITE_ADMIN" permissions 

    body args: 
    {
        boardId (int, required): ID of the board to delete
    }
*/
const handleDeleteBoardRequest = async function(req, res)
{
    const deleteRequest = await boardService.removeBoards({boardIds: [req.body.boardId]});
    if(!deleteRequest.ok)
    {
        res.status(deleteRequest.statusCode).send(deleteRequest.error);
        return;
    }
    res.status(200).send({status: "SUCCESS"});
}


module.exports = {
    handleDeleteBoardRequest,
    handleSystemMessageRequest,
    handleBoardPicUploadConfirmationRequest, 
    handleBoardPicPresignedUrlRequest, 
    handlePopularBoardsRequest, 
    handleEditBoardRequest, 
    handleBoardSearchRequest, 
    handleBoardFeedRequest,
    handleBoardRequest, 
    handleNewBoardRequest};