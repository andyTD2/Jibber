"use strict";
require("express-async-errors")
const errors = require(baseDir + "/src/utils/error")
const {format: sqlFormat} = require("mysql2/promise");

const db = require(baseDir + "/src/utils/db");
const dbCon = db.pool;
const mysql = db.mysql;
const queryDb = db.queryDb;

const {parseOffset} = require(baseDir + "/src/utils/misc");
const { sanitizeHtml } = require(baseDir + "/src/utils/sanitize");


/*
    A BOARD table contains the following columns:

    {
        id (int): ID of the board
        title (str): Title of the board
        description (str): Description of the board
        sidebar (str): Sidebar description of the board
        createdBy (str): Name of the creator
        postCount (int): Number of posts contained in the board
        numSubscribers (int): Number of users subscribed to the board
        createdAt (date): Date of board creation
        boardPicture (str): URL for the board pfp
    }
*/


/*
    Loads board data, given a name or id.

    boardName (str, optional): Board name to search for
    boardId (int, optional): Board id to search for. Will be used
        if boardName is not provided.

    return (obj): Returns an object containing board data. See top of file for details on format.
*/
const getBoardData = async function({boardName, boardId}) {
    
    let query = "SELECT * FROM boards WHERE";
    let params = [];

    if(boardName)
    {
        query += " title = ?"
        params.push(boardName);
    }
    else if (boardId)
    {
        query += " id = ?"
        params.push(boardId);
    }
    else
    {
        return undefined;
    }

    const result = await queryDb(query, params);

    if (result.length === 0)
    {
        return undefined;
    }
    return result[0];
};

/*
    Updates the number of posts in a board

    boardId (int, required): Board ID of the board to update
    amount (int, optional, default: 1): Amount to add to the current post count 
*/
const addNumPosts = async function(boardId, amount = 1)
{
    await queryDb("UPDATE boards SET postCount = postCount + ? WHERE id = ?", [amount, boardId]);
    return;
}

/*
    Updates the number of subscribers for a board

    boardId (int, required): Board ID of the board to update
    amount (int, optional, default: 1): Amount to add to the current subscriber count

*/
const addNumSubscribers = async function(boardId, amount = 1) {
    await queryDb("UPDATE boards SET numSubscribers = numSubscribers + ? WHERE id = ?", [amount, boardId]);
    return;
}

/*
    Inserts a new board into the database.

    boardName (str, required): Name of the board to insert
    description (str, optional): Description of the board
    sidebar (str, optional): Sidebar description of the board
    userId (int, required): ID of the user who created the board

    return (int): The ID of the newly inserted board
*/
const insertBoard = async function(boardName, description, sidebar, userId)
{
    // Creates a random index in order to choose a random picture url
    // from the config array
    const randomIndex = Math.floor(Math.random() * CONFIG.DEFAULT_GROUP_PROFILE_PICS.length);
    const boardPic = `${SECRETS.R2_URL}/boards/defaultBoardPictures/${CONFIG.DEFAULT_GROUP_PROFILE_PICS[randomIndex]}`;

    const boardInsert = await queryDb("INSERT INTO boards (title, description, sidebar, createdBy, boardPicture) VALUES(?, ?, ?, ?, ?)",
                [boardName, description, sidebar, userId, boardPic]);
    return boardInsert.insertId;
}

/*
    Updates a board's description, sidebar, or id

    description (str, optional): New description of the board
    sidebar (str, optional): New sidebar of the board
    boardId (int, required): ID of the board to update
*/
const editBoard = async function(description, sidebar, boardId)
{
    await queryDb("UPDATE boards SET description = ?, sidebar = ? WHERE id = ?;", [description, sidebar, boardId]);
    return;
}


/*
    Performs a search for boards

    searchQuery (str, required): Search query used to match results against
    offset (int, required): Number of results to skip/offset

    return (obj):
        endOfItems (bool): Whether or not there are any remaining items beyond those in the results
        items ([obj]): A list of board items. See top of file for format. In addition to the normal format, 
            the items array contains objects which contain the following property:

                type (str): Sets type as "board", allows us to differentiate item types
*/
const queryBoards = async function(searchQuery, offset)
{
    const newOffset = parseOffset(offset);

    //Uses levenshtein function in the db to fuzzy match
    let query = `   
                SELECT id, title, description, createdAt, numSubscribers, postCount, boardPicture, \"board\" AS type 
                FROM 
	            (
                    SELECT id, title, description, postCount, boardPicture, createdAt, numSubscribers
                    FROM boards 
                    WHERE title LIKE ? AND deleted = false 
	            ) as initialMatch
                ORDER BY levenshtein(?, title)
                LIMIT ?
                OFFSET ?;`

    let params = [`%${searchQuery}%`, searchQuery, CONFIG.ITEMS_PER_PAGE + 1, newOffset];

    let items = await queryDb(query, params);

    //End of items checks if there are any remaining items which aren't included in the results. This will
    //let the client know whether or not there are more items to load.
    let endOfItems = true;
    if(items.length > CONFIG.ITEMS_PER_PAGE)
    {
        endOfItems = false;
        items.pop();
    }

    if(items.error) return {error: items.error};

    return {items, endOfItems};
}


/*
    Retrieves a list of popular boards from the db.

    limit (int, optional, default: see config): The amount of popular boards to retrieve

    return (obj):
        {
            items ([obj]): A list of board items.
        }
*/
const getPopularBoards = async function(limit = CONFIG.MAX_LENGTH_POPULAR_BOARDS_DISPLAY)
{
    const results = await queryDb(`
                                    SELECT
                                        id,
                                        title,
                                        description,
                                        sidebar,
                                        boardPicture
                                    FROM
                                        boards 
                                    WHERE
                                        deleted = false
                                    ORDER BY 
                                        numSubscribers DESC 
                                    LIMIT ?`
                                    
                                , [limit]);
    return {items: results};
}

/*
    Sets the img url of a board picture.

    boardId (int, required): ID of the board to update
    boardPicLink (str, required): The new img url
*/
const setBoardPic = async function(boardId, boardPicLink)
{
    await queryDb("UPDATE boards SET boardPicture = ? WHERE id = ?", [boardPicLink, boardId]);
}

/*
    Sets the new frontpage message in the sidebar.

    newMessageHtml (str/html, required): The new frontpage message. HTML
        will be rendered on the frontpage.
*/
const insertSystemMessage = async function(newMessageHtml)
{
    newMessageHtml = sanitizeHtml({content: newMessageHtml});
    await queryDb("INSERT INTO systemMessages (content) VALUES (?)", [newMessageHtml]);
    return;
}

/*
    Retrieves the current system message

    returns (obj):
    {
        messageId (int): ID of the message
        content (str/html): Message content, will be rendered as HTML
        createdAt (date): Date of message creation
    }
*/
const getSystemMessage = async function()
{
    const message = await queryDb("SELECT * FROM systemMessages ORDER BY messageId DESC LIMIT 1", [])
    return message;
}

/*
    Mark boards as being deleted.

    boardIds ([int], required): Array of IDs of the boards to mark as being deleted

    returns (bool): Whether any boards were successfully updated.
*/
const markBoardsAsDeleted = async (boardIds) =>
{
    const deleteOp = await queryDb("UPDATE boards SET deleted = TRUE WHERE id IN (?)", [boardIds]);
    return deleteOp.affectedRows;
}


module.exports = {
    markBoardsAsDeleted,
    getSystemMessage,
    insertSystemMessage,
    setBoardPic, 
    getPopularBoards, 
    addNumPosts, 
    addNumSubscribers,
    editBoard, 
    getBoardData, 
    insertBoard, 
    queryBoards 
};