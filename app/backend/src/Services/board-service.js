const userModel = require(baseDir + "/src/Models/user-model");
const boardModel = require(baseDir + "/src/Models/board-model");
const postModel = require(baseDir + "/src/Models/post-model");
const commentModel = require(baseDir + "/src/Models/comment-model");
const { sanitizeHtml } = require(baseDir + "/src/utils/sanitize");
const { generatePresignedUploadURL } =  require(baseDir + "/src/utils/r2Access");
const { purgeCacheUrl } =  require(baseDir + "/src/utils/cloudflare")
const { getDecodedHtmlLength } = require(baseDir + "/src/utils/misc");

const filters = {

    hot: "score",
    new: "createdAt",
    top: "numVotes"
};

const timeFilters = {
    day: "1 DAY",
    week: "1 WEEK",
    month: "1 MONTH",
    year: "1 YEAR"
}

/*
    Retrieves posts from a provided board

    boardData (obj, required): Board metadata. Typically retrieved by middleware. Must contain the board id
    timeFilter (str, optional, default: "all time"): Filter by time value (day, week, etc.)
    filter (str, optional, default: "hot"): Filter value (new, hot, top, etc.)
    lastSeen (int, optional): The last post that was seen/loaded. Necessary when sorting by new
    offset (int, optional, default: 0): The amount of results to skip. Used for pagination
    userId (int, optional): ID of current user. Omitting this will omit vote data from results.

    returns (obj):
        {
            ok (bool): false if error
            data: Data retrieved from DB. See postModel.getPostsByBoard for more
        }
*/
const getBoardPosts = async function({boardData, timeFilter, filter, lastSeen, offset, userId})
{
    const data = await postModel.getPostsByBoard({timeFilter, filter, boardId: boardData && boardData.id, lastSeen, offset, userId, defaultFilters: filters, defaultTimeFilters: timeFilters});
    return {ok: true, data};
}

/*
    Retrieves user subscription status for a board and returns the data.

    boardData (obj, required): Board metadata. Typically retrieved by middleware. Must contain the board id
    userId (int, optional): The user ID to check subscription status of. Omitting since will return a value
        of false for isSubscribed
        
    returns (obj):
        {
            ok (bool): false if error
            data: Data retrieved from DB. See userModel.getUserSubscriptionStatus for more
        }
*/
const getBoard = async function(boardData, userId) {
    let params = {
        board: boardData,
        isSubscribed: await userModel.getUserSubscriptionStatus(userId, (boardData && boardData.id))
    }

    return {ok: true, data: params};
}

/*
    Retrieves the most popular boards (by num subscribers).

    limit (int, optional): The number of popular boards to retrieve.

    returns (obj):
        {
            ok (bool): false if error
            data: Data retrieved from DB. See boardModel.getPopularBoards for more
        }
*/
const getPopularBoards = async function(limit)
{
    const result = await boardModel.getPopularBoards(limit);
    return {ok: true, data: result}
}

/*
    Creates a new board. First performs validation checks on board name, description, and sidebar.
    It then inserts the board into the database, and gives the creator moderator status.

    boardName (str, required): Name of the board
    description (str, optional): Description of the board
    sidebar (str, optional): Sidebar description of the board
    userId (int, required): User ID of the creator 

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const createBoard = async function(boardName, description, sidebar, userId) {
    if(boardName.length < 3 || boardName.length > CONFIG.MAX_LENGTH_BOARD_NAME)
    {
        return {ok: false, statusCode: 400, error: "Name must be between 3 and 30 characters."};
    }

    if(description.length > CONFIG.MAX_LENGTH_BOARD_DESCRIPTION)
    {
        return {ok: false, statusCode: 400, error: `Description must be under ${CONFIG.MAX_LENGTH_BOARD_DESCRIPTION}`};
    }

    if(sidebar.length > CONFIG.MAX_LENGTH_BOARD_SIDEBAR * 3 || getDecodedHtmlLength(sidebar) > CONFIG.MAX_LENGTH_BOARD_SIDEBAR)
    {
        return {ok: false, statusCode: 400, error: `Sidebar must be under ${CONFIG.MAX_LENGTH_BOARD_SIDEBAR} characters`};
    }

    // Checks for alphabetical and numerical characters
    const alphanumeric = new RegExp("^[a-zA-Z0-9]*$");
    if(!alphanumeric.test(boardName))
    {
        return {ok: false, statusCode: 400, error: "Board name may only consist of letters and numbers."};
    }

    // Check if board already exists
    if(await boardModel.getBoardData({boardName}))
    {
        return {ok: false, statusCode: 400, error: "This board name has already been taken."};
    }

    description = sanitizeHtml({content: description});
    sidebar = sanitizeHtml({content: sidebar});
    const insertId = await boardModel.insertBoard(boardName, description, sidebar, userId);
    // Make creator a moderator
    await userModel.insertUserPermissions({userId, newPermission: "MODERATION", boardId: insertId});

    return {ok: true};
}

/*
    Performs a search query for boards.

    searchQuery (str, required): The search query to match results against
    offset (int, optional, default: 0): The number of results to skip from start

    returns (obj):
        {
            ok (bool): false if error
            data: Data retrieved from DB. See boardModel.queryBoards for more
        }
*/
const queryBoards = async function(searchQuery, offset)
{
    if(searchQuery == undefined)
    {
        return {ok: false, statusCode: 400, error: "No query provided"};
    }

    const data = await boardModel.queryBoards(searchQuery.trim(), offset);

    if(data.error) return {ok: false, error: data.error};

    return {ok: true, data};
}

/*
    Makes changes to a boards description or sidebar.

    description (str, optional): The new description for the board
    sidebar (str, optional): The new sidebar description for the board

    returns (obj):
        {
            ok (bool): false if error
            data: the new description and sidebar
        }
*/
const editBoard = async function(description, sidebar, boardId)
{
    if(description.length > CONFIG.MAX_LENGTH_BOARD_DESCRIPTION)
    {
        return {ok: false, statusCode: 400, error: `Description must be under ${CONFIG.MAX_LENGTH_BOARD_DESCRIPTION}`};
    }

    if(getDecodedHtmlLength(sidebar) > CONFIG.MAX_LENGTH_BOARD_SIDEBAR || sidebar.length > (CONFIG.MAX_LENGTH_BOARD_SIDEBAR * 3))
    {
        return {ok: false, statusCode: 400, error: `Sidebar must be under ${CONFIG.MAX_LENGTH_BOARD_SIDEBAR} characters.`};
    }

    //Sanitize html, and specifically remove p tags
    description = sanitizeHtml({content: description});

    sidebar = sanitizeHtml({content: sidebar});

    await boardModel.editBoard(description, sidebar, boardId);

    return {ok: true, data: {description, sidebar}};
}

/*
    Performs validation on a presigned url request, then generates the presigned url
    if inputs are valid.

    fileSize (int, required): Size of the file in bytes. 10,000,000(10MB) max.
    fileExtension (str, required): Extension of the file. "jpg" or "png" only.
    boardId (int, required): The ID of the board to upload the pfp to.

    returns (obj):
        {
            ok (bool): false if error
            presignedURL: the generated presigned URL
        }
*/
const getBoardPicUploadURL = async function(fileSize, fileExtension, boardId)
{
    if(!fileSize || !fileExtension || !boardId)
    {
        return {ok: false, statusCode: 400, error: "Missing arguments"};
    }

    if(fileSize > 10_000_000)
    {
        return {ok: false, statusCode: 400, error: "File size must be under 10MB."}
    }

    fileExtension = fileExtension.toLowerCase();
    if(fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg")
    {
        return {ok: false, statusCode: 400, error: "File must be jpg or png."};
    }

    const presignedURL = await generatePresignedUploadURL(`boards/${boardId}/boardPic.${fileExtension}`, `putObject`, SECRETS.R2_BUCKET_NAME, 3000);
    return {ok: true, presignedURL: presignedURL};
}

/*
    Performs validation on the upload. Purges cloudflare cache of newly 
    uploaded board profile picture. Sets the correct image link for the board
    if confirmed.

    boardId (int, required): Board ID belonging to the board for which the image was uploaded to
    fileExtension (str, required): Extension of the file. "jpg" or "png" only.

    returns (obj):
        {
            ok (bool): false if error
            url: The file URL of the uploaded file
        }
*/
const confirmBoardPicUpload = async function(boardId, fileExtension)
{
    fileExtension = fileExtension.toLowerCase();
    if(fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg")
    {
        return {ok: false, statusCode: 400, error: "File must be jpg or png"};
    }

    //Purge cloudflare cache
    let fileUrl = `${SECRETS.R2_URL}/boards/${boardId}/boardPic.${fileExtension}`;
    await purgeCacheUrl([fileUrl]);

    fileUrl += `?t=${Date.now()}`;

    //Set img url of the pfp
    await boardModel.setBoardPic(boardId, fileUrl);

    return {ok: true, url: fileUrl};
}

const getSystemMessage = async function()
{
    const message = await boardModel.getSystemMessage();
    return {ok: true, systemMessage: message[0]};
}

/*
    Removes boards. Note "removing" a board in this context does NOT delete
    it entirely. It marks the board as "deleted", which will then be hidden from users.

    boardIds ([int], required): IDs of the boards to hide

    returns (obj):
    {
        ok (bool): True if post was successfully hidden.
    }
*/
const removeBoards = async function({boardIds})
{
    if(!boardIds || boardIds.length < 1)
    {
        return {ok: false, statusCode: 400, error: "Invalid board ID(s)."}
    }

    const boardRemoved = await boardModel.markBoardsAsDeleted(boardIds);
    await postModel.markBoardPostsAsDeleted(boardIds);
    await commentModel.markBoardCommentsAsDeleted(boardIds);

    if(!boardRemoved)
    {
        return {ok: false, statusCode: 400, error: "Board ID(s) not found."};
    }
    return {ok: true};
}


module.exports = {
    removeBoards,
    getSystemMessage,
    confirmBoardPicUpload, 
    getBoardPicUploadURL, 
    getPopularBoards, 
    editBoard, 
    getBoardPosts, 
    getBoard, 
    createBoard, 
    queryBoards
};