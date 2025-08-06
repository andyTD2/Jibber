const db = require(baseDir + "/src/utils/db");
const dbCon = db.pool;
const mysql = db.mysql;
const queryDb = db.queryDb;

const {parseOffset, getFilterQuery} = require(baseDir + "/src/utils/misc");
const commentModel = require(baseDir + "/src/Models/comment-model");
const postModel = require(baseDir + "/src/Models/post-model");
const {format: sqlFormat} = require("mysql2/promise");

/*
    Format of users row/obj:
    {
        id (int): ID of the user
        username (str): Username of the user
        userPassword (str): Encrypted password for the user
        createdAt (date): Date of account creation
        numVotes (int): Number of votes on user's posts/comments
        email (str): User email
    }
    - userPassword should not be retrieved unless relevant

    Format of boardSubscriptions obj/row:
    {
        userId (int): ID of the user who is subscribed
        boardId (int): ID of the board that is subscribed to
        id (int): ID of the subscription
    }

    Format of profile rows:
    {
        id (int): ID of the profile's user
        description (str): Profile description
        bio (str): Profile's bio
        profilePicture (str): Profile's picture/avatar
    }

    Format of direct user message objects/rows:
    {
        id (int): ID of the message
        senderId (int): ID of the user who sent the message
        recipientId (int): ID of the user who received the message
        title (str): Title of the message
        body (str): Body/text content of the message
        status (str): "read" or "unread"
        createdAt (date): Date the message was created
        parentId (int): ID of the parent message, only present if this message is a reply
    }
*/



/*
    Finds a specific user. Username must exactly match.

    username (str, required): Username of the account to search for
    includeUnverifiedUsers (bool, optional, default: false): Set to true if the search should
        also include accounts that are unverified
    includeVerifiedUsers (bool, optional, default: true): Set to true if the search should also include
        accounts that are verified

    returns (obj): User data. See top of file for format
*/
const getExactUser = async function({username, includeUnverifiedUsers=false, includeVerifiedUsers=true})
{
    let sql = "";
    let params = [];

    if(includeUnverifiedUsers && includeVerifiedUsers)
    {
        sql = `SELECT id, username, email, userPassword, FALSE AS requires_verification
                FROM users
                WHERE username = ?

                UNION

                SELECT NULL as id, username, email, userPassword, TRUE AS requires_verification
                FROM unverifiedusers
                WHERE username = ?;`
        params = [username, username];
    }
    else if(!includeVerifiedUsers)
    {
        sql = "SELECT * FROM unverifiedusers WHERE username = ?;";
        params = [username];
    }
    else
    {
        sql = "SELECT * FROM users WHERE username = ?;"
        params = [username];
    }

    let result = await queryDb(sql, params);

    if(result.length < 1) return undefined;

    return result[0];
}

/*
    Checks whether a user is currently subscribed to a board. If a subscription record
    is present with matching user and board IDs, then the user is currently subscribed.

    userId (int, required): ID of the user who is subscribed to a board
    boardId (int, required): ID of the subscribed board

    returns (bool): Whether the user is subscribed or not
*/
const getUserSubscriptionStatus = async function(userId, boardId)
{
    if(!userId || !boardId) return false;

    return (await queryDb("SELECT * FROM boardSubscriptions WHERE userId = ? AND boardId = ?", [userId, boardId])).length > 0;
}

/*
    Insert subscription record into the DB.

    userId (int, required): ID of the user who is subscribing
    boardId (int, required): ID of the board being subscribed to
*/
const subscribeToBoard = async function(userId, boardId)
{
    await queryDb("INSERT INTO boardSubscriptions (userId, boardId) VALUES (?, ?)", [userId, boardId]);
    return
}

/*
    Removes a subscription record from the DB.

    userId (int, required): ID of the user who is unsubscribing
    boardId (int, required): ID of the board that the user wants to unsubscribe from
*/
const unsubscribeToBoard = async function(userId, boardId)
{
    await queryDb("DELETE FROM boardSubscriptions WHERE userId = ? AND boardId = ?", [userId, boardId]);
    return;
}

/*
    Retrieves a list of user subscriptions from DB.

    userId (int, required): ID of the user who is subscribed to a board
    boardId (int, required): ID of the subscribed board

    returns (obj):
    {
        endOfItems (bool): Whether there are remaining items that have yet to be retrieved
        items ([obj]): List of boardSubscription records. See top of file for format
    }
*/
const getSubscribedBoards = async function(userId, lastSeen = 0)
{
    const results = await queryDb(` SELECT boardId, title, boardSubscriptions.id AS subscriptionId, boardPicture
        FROM boardSubscriptions 
        LEFT JOIN boards ON boardId = boards.id
        WHERE userId = ? AND deleted = false AND boardSubscriptions.id > ? 
        ORDER BY boardSubscriptions.id ASC
        LIMIT ?`, 
        [userId, lastSeen, CONFIG.MAX_LENGTH_SUBSCRIPTIONS_DISPLAY + 1]);

    let endOfItems = true;
    if(results.length > CONFIG.MAX_LENGTH_SUBSCRIPTIONS_DISPLAY)
    {
        endOfItems = false;
        results.pop();
    }

    return {endOfItems, items: results};
}

/*
    Performs a search query for matching profiles.

    profileName (str, required): Profile name to search for. Does not have to be exact.
    offset (int, optional): The amount of results to skip. Ie., skip the first 20 matching profiles

    returns (obj):
    {
        endOfItems (bool): Whether there are remaining items that have yet to be retrieved
        items ([obj]): List of profile records. See top of file for format
    }
*/
const queryProfiles = async function(profileName, offset)
{
    const newOffset = parseOffset(offset);

    //Only search for profiles that aren't banned sitewide
    let query = `
                SELECT username, bio, profilePicture, createdAt, description, numVotes, id, "profile" AS type
                FROM 
                (
                    SELECT username, bio, description, users.id, createdAt, profilePicture, numVotes
                    FROM profiles LEFT JOIN users ON users.id = profiles.id 
                    WHERE users.username LIKE ? AND NOT EXISTS 
                    (
                        SELECT 1
                        FROM userbans
                        WHERE userbans.userId = users.id AND userbans.isSitewide = 1
                    )
                ) as initialMatch
                ORDER BY levenshtein(?, username)
                LIMIT ?
                OFFSET ?`;

    let params = [`%${profileName}%`, profileName, CONFIG.ITEMS_PER_PAGE + 1, newOffset]

    let items = await queryDb(query, params);

    let endOfItems = true;
    if(items.length > CONFIG.ITEMS_PER_PAGE)
    {
        endOfItems = false;
        items.pop();
    }

    if(items.error) return {error: items.error};

    return  {
                items,
                endOfItems
            };
}

/*
    Retrieve a single, specific profile. Either a profileName or profileId must be provided.

    profileName (str, optional): Name of the profile to search for. Must be exact match
    profileId (int, optional): Alternatively, search for the profile with an ID.

    returns (obj): The matching profile, if it exists.
*/
const getProfile = async function({profileName, profileId})
{
    //Query for profile

    let query = `SELECT username, numVotes, bio, createdAt, profilePicture, description, users.id, "profile" AS type
                FROM profiles LEFT JOIN users ON users.id = profiles.id 
                WHERE `;

    let params = [];

    if(profileName)
    {
        query += "users.username = ?"
        params.push(profileName);
    }
    else if (profileId)
    {
        query += "users.id = ?"
        params.push(profileId);
    }

    let items = await queryDb(query, params);

    if(items.error) return {error: items.error};

    return  {items}
}

/*
    Insert a new profile record into the DB

    profileId (int, required): ID of the profile to insert. Needs to match ID of the user.
    description (str, optional): Description of the profile
    bio (str, optional): Profile's bio
    profilePic (str, required): URL link to profile picture.

    returns (int): ID of the newly inserted profile.
*/
const insertProfile = async function(profileId, description, bio, profilePic)
{
    //Retrieve a random profile pic
    if(!profilePic)
    {
        const randomIndex = Math.floor(Math.random() * CONFIG.DEFAULT_PROFILE_PICS.length);
        profilePic = `${SECRETS.R2_URL}/profiles/defaultProfilePictures/${CONFIG.DEFAULT_PROFILE_PICS[randomIndex]}`;
    }

    let query = `INSERT INTO profiles (id, profilePicture, description, bio) VALUES(?, ?, ${description ? `?` : "NULL"}, ${bio ? `?` : "NULL"})`;

    let result = await queryDb(query, [profileId, profilePic, description, bio]);
    return result.insertId;
}

/*
    Insert a new user record into the DB.

    email (str, required): Email of the user.
    username (str, required): Account's username
    hashedPassword (str, required): Password for the account. Must be hashed.

    returns (int): ID of the inserted user
*/
const insertUser = async function(email, username, hashedPassword)
{
    let result = await queryDb("INSERT INTO users (email, username, userPassword) VALUES(?, ?, ?);", [email, username, hashedPassword]);
    return result.insertId;
}

/*
    Inserts a new unverified user into the DB. Unverified users exist in a separate
    table and will not have access to the same functionality as a verified user.

    email (str, required): Email of the user.
    username (str, required): Account's username
    hashedPassword (str, required): Password for the account. Must be hashed.

    returns (int): ID of the inserted user
*/
const insertUnverifiedUser = async function(email, username, hashedPassword)
{
    let result = await queryDb("INSERT INTO unverifiedusers (email, username, userPassword) VALUES(?, ?, ?);", [email, username, hashedPassword]);
    return result.insertId;
}

/*
    Update a user's password in the DB.

    username (str, required): Name of the account to update
    newHashedPassword (str, required): New password to update. Must be hashed.
    isVerified (bool, required): Whether or not the user is verified. 
*/
const updateUserPassword = async function(username, newHashedPassword, isVerified)
{
    let query = `UPDATE ${isVerified ? "users" : "unverifiedusers"} SET userPassword = ? WHERE username = ?`;
    await queryDb(query, [newHashedPassword, username]);
    return;
}

/*
    Remove an unverified user from the unverifiedUsers table. This SQL query will also
    delete any verification codes belonging to the user.

    username (str, required): Username of the account to delete.
*/
const deleteUnverifiedUser = async function(username)
{
    //accountVerificationCodes has ON DELETE CASCADE
    await queryDb("DELETE FROM unverifiedusers WHERE username = ?", [username]);
    return;
}


const filters = {
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
    Retrieve user's account history. Account history includes a user's posts and comments.

    profileName (str, required): Name of the profile to retrieve
    userId (int, required): ID of the current user. Not necessarily the same as the profile's owner.
    offset (int, optional): How many results to skip. Ie., retrieve user history after the first 20 items.
    lastSeen (int, optional): ID of the last seen user activity item. If sorting by new, any items retrieved
        will be older than the last seen post.
    filter (str, optional): Filter method to sort results by.
    timeFilter (str, optional): Date filter to sort results by.

    returns (obj):
    {
        endOfItems (bool): Whether there are remaining items that have yet to be retrieved
        items ([obj]): List of posts and comment records. post-model.js and comment-model.js
            for format of these records.
    }
*/
const getUserActivity = async function({profileName, userId, offset, lastSeen, filter, timeFilter})
{
    const orderBy = getFilterQuery(filter, "new", filters);
    const orderByTime = getFilterQuery(timeFilter, "All Time", timeFilters);
    const newOffset = parseOffset(offset);

    let postWhere = " AND posts.deleted = FALSE";
    let commentWhere = " AND comments.deleted = FALSE";
    const params = [profileName]

    if(orderBy == "createdAt" && lastSeen)
    {
        postWhere += " AND posts.id < ?"
        commentWhere += " AND comments.id < ?"
        params.push(lastSeen, profileName, lastSeen);
    }
    else if(orderBy == "numVotes" && orderByTime)
    {
        postWhere += ` AND posts.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${orderByTime})`
        commentWhere += ` AND comments.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${orderByTime})`
        params.push(profileName)
    }
    else
        params.push(profileName)

    // Union of posts and comments
    let query = `   SELECT 
                        'post' AS type, posts.id, 
                        posts.createdAt,
                        TIMESTAMPDIFF(MINUTE, posts.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation,
                        posts.content, 
                        posts.numVotes, 
                        NULL AS postId, 
                        NULL AS parentId, 
                        posts.title, 
                        boardId, 
                        link, 
                        imgSrc, 
                        boards.title AS boardName,
                        boardPicture,
                        commentCount,
                        users.username AS author
                    FROM 
                        posts
                    LEFT JOIN 
                        boards on posts.boardId = boards.id
                    LEFT JOIN 
                        users ON users.id = posts.userId
                    WHERE 
                        users.username = ? ${postWhere}
                    UNION ALL
                    SELECT 
                        'comment' AS type, 
                        comments.id, 
                        comments.createdAt,
                        TIMESTAMPDIFF(MINUTE, comments.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation,
                        comments.content, 
                        comments.numVotes, 
                        postId, 
                        parentId, 
                        posts.title as title, 
                        posts.boardId, 
                        posts.link, 
                        posts.imgSrc, 
                        boards.title AS boardName,
                        boardPicture,
                        NULL AS commentCount,
                        users.username AS author
                    FROM 
                        comments
                    LEFT JOIN 
                        posts ON comments.postId = posts.id
                    LEFT JOIN 
                        boards ON posts.boardId = boards.id
                    LEFT JOIN 
                        users ON users.id = comments.userId
                    WHERE 
                        users.username = ? ${commentWhere}
                    ORDER BY 
                        ${orderBy} DESC 
                    LIMIT ${CONFIG.ITEMS_PER_PAGE + 1}`

    if(orderBy != "createdAt" || !lastSeen)
    {
        query += " OFFSET ?";
        params.push(newOffset);
    }
    let items = await queryDb(query, params);

    //endOfItems signifies whether or not there remaining items left to retrieve
    let endOfItems = true;
    if(items.length > CONFIG.ITEMS_PER_PAGE)
    {
        endOfItems = false;
        items.pop();
    }

    //separate the items into comments and posts
    const comments = [];
    const posts = [];
    for (let item of items)
    {
        if(item.type == "comment")
            comments.push(item.id);
        else
            posts.push(item.id);
    }

    //get current user's vote direction for posts and comments
    const postVoteMap = await postModel.getPostVoteDirection(userId, posts);
    const commentVoteMap = await commentModel.getCommentVoteDirection(userId, comments);

    for(let item of items)
    {
        if(item.type == "comment")
            item.voteDirection = commentVoteMap[item.id];
        else
            item.voteDirection = postVoteMap[item.id];
    }

    return {
        endOfItems,
        items
    };
}

/*
    Alters/updates a user's profile.

    profileName (str, required): Name of the profile to update.
    description (str, optional): New description to replace old one
    bio (str, optional): New profile bio
*/
const alterProfile = async function(profileName, description, bio)
{
    let query = `UPDATE profiles
    JOIN users ON profiles.id = users.id
    SET profiles.description = ?, profiles.bio = ?
    WHERE users.username = ?;`

    await queryDb(query, [description, bio, profileName]);

    return;
}

/*
    Adjust a user's vote score.

    userId (int, required): ID of the user whos vote will be modified
    numVotes (int, required): Number of votes to add to the user's existing votes.
*/
const addVotes = async function(userId, numVotes)
{
    await queryDb("UPDATE users SET numVotes = numVotes + ? WHERE id = ?", [numVotes, userId]);
    return;
}

/*
    Insert new user message record into the DB.

    senderId (int, required): ID of the mail's sender.
    recipientId (int, required): ID of the mail's recipient.
    title (str, required): Title of the message
    body (str, optional): Text content of the message
    parentId (int, optional): If the message is a reply to an existing message,
        parentId should the ID of the original message.

    return (obj):
    {
        insertId (int): ID of the recently inserted message
    }
*/
const insertMessage = async function(senderId, recipientId, title, body, parentId)
{
    let query = "";
    let params = [senderId, recipientId, body]
    if(!parentId)
    {
        query = `   INSERT INTO messages (senderId, recipientId, body, title)
                    VALUES(?, ?, ?, ?)`
        params.push(title);
    }
    else
    {
        query = ` INSERT INTO messages (senderId, recipientId, body, parentId)
                    VALUES(?, ?, ?, ?)`
        params.push(parentId);
    }

    const insertResult = await queryDb(query, params);

    return {insertId: insertResult.insertId};
}

/*
    Set the read status of messages.

    recipientId (int, required): ID of the message recipient. This is the user whose
        message statuses will be updated.
    messageIds ([int], required): List of message IDs to update.
    newStatus (str, required): Status to set the messages to. Can be "read" or "unread".
*/
const setMessageStatus = async function(recipientId, messageIds, newStatus)
{
    //validate status input; should only contain these two values
    if(newStatus != "read")
    {
        newStatus = "unread";
    }

    let query = `
                UPDATE messages
                SET status = ?
                WHERE id IN (?) AND recipientId = ?
        `
    await queryDb(query, [newStatus, messageIds, recipientId]);
    return;
}

/*
    Given a list of parent message IDs, retrieve all replies. Replies are unsorted.

    threadIds ([int], required): List of parent message IDs to retrieve replies for

    returns ([obj]): List of message objects. See top of file for format.
*/
const getMessageReplies = async function(threadIds)
{
    if(threadIds.length < 1) return [];

    let query = `
                SELECT 
	                messages.id, 
                    senderId, 
                    recipientId, 
                    body, status, 
                    TIMESTAMPDIFF(MINUTE, messages.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation, 
                    parentId, 
                    sender.username AS sender_name,
                    recipient.username AS recipient_name
                FROM
                    messages
                JOIN 
                    users AS sender ON sender.id = senderId
                JOIN 
                    users AS recipient ON recipient.id = recipientId
                WHERE 
                    parentId IN (?)
                ORDER BY
                    id ASC`

    const messages = await queryDb(query, [threadIds]);

    return messages;
}

/*
    Retrieve user messages, including any replies/message threads.

    userId (int, required): ID of the user whos messages are being retrieved
    lastSeen (int, optional): ID of the last message. Any more results will be loaded
        using this message as the starting point
    messageType (str, required): "inbox" messages are incoming. "sent" types are outgoing.

    returns (obj):
    {
        endOfItems (bool): Whether there are remaining messages that have yet to be retrieved
        items ([obj]): List messages. See top of file for format. In addition to the described format 
            above. Each message also has a replies array, which contains child messages.
    }
*/
const getMessages = async function(userId, lastSeen, messageType)
{
    let messageTypeSql = "";
    if(messageType == "inbox")
    {
        messageTypeSql = "AND child.recipientId = ? AND child.status = 'unread'";
    }
    else if (messageType == "sent")
    {
        messageTypeSql = "AND child.senderId = ?"
    }
    else
    {
        messageTypeSql = "AND child.recipientId = ?"
    }
    let params = [userId];

    let lastSeenSql = "";
    if(lastSeen)
    {
        lastSeenSql = "HAVING most_recent_child_id < ?"
        params.push(lastSeen);
    }
    params.push(CONFIG.MESSAGES_PER_PAGE + 1)


    //This query selects all message threads(messages without a parentId)
    //that have at least 1 unread message in their hierarchy.

    //It does this by joining child messages on the parent they belong to. 
    //If a parent has no children, it is joined on itself
    //The results are grouped by id
    //It then sorts them by most recent message(max of child.id)
    //most_recent_child_id is then discarded, and from the returned array we query
    //the matching message
    let query = `   
                    WITH recentMessageThreads AS 
                    (
                        SELECT parent.id, MAX(child.id) AS most_recent_child_id
                        FROM messages parent
                        JOIN messages child
                        ON child.parentId = parent.id OR child.id = parent.id
                        WHERE parent.parentId IS NULL ${messageTypeSql}
                        GROUP BY parent.id
                        ${lastSeenSql}
                        ORDER BY most_recent_child_id DESC
                        LIMIT ?
                    )

                    SELECT 
                        messages.id, 
                        senderId, 
                        recipientId, 
                        title, 
                        body, 
                        status, 
                        TIMESTAMPDIFF(MINUTE, messages.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation,
                        sender.username AS sender_name,
                        recipient.username AS recipient_name,
                        senderProfile.profilePicture AS senderProfilePic,
                        recipientProfile.profilePicture AS recipientProfilePic,
                        most_recent_child_id
                    FROM 
                        messages 
                    JOIN 
                        recentMessageThreads ON recentMessageThreads.id = messages.id
                    JOIN 
                        users AS sender ON senderId = sender.id
                    JOIN
                        profiles AS senderProfile ON senderId = senderProfile.id
                    JOIN 
                        users AS recipient ON recipientId = recipient.id
                    JOIN
                        profiles AS recipientProfile ON recipientId = recipientProfile.id
                    ORDER BY 
						recentMessageThreads.most_recent_child_id DESC
                `

    let parentMessages = await queryDb(query, params);
    let endOfItems = true;
    if(parentMessages.length > CONFIG.MESSAGES_PER_PAGE)
    {
        parentMessages.pop();
        endOfItems = false;
    }

    const messageThreadMap = {};

    // Setup containers to store message replies
    // messageThreadMap allows us to easily determine the index of messages inside
    // parentMessages array.
    const parentIds = parentMessages.map((item, idx) => 
    {
        messageThreadMap[item.id] = idx; 
        item["replies"] = [];
        return item.id;
    });

    // Retrieve replies for each message
    const replies = await getMessageReplies(parentIds);
    for(const reply of replies)
    {
        parentMessages[messageThreadMap[reply.parentId]].replies.push(reply)
    }

    return {endOfItems, items: parentMessages};
}


/*
    Retrieve only the parent messages for a user. Unread messages take priority.

    userId (int, required): ID of the user whose messages are being retrieved
    lastSeen (int, optional): ID of the last message, which will be the starting point of
        any further messages that are loaded.

    returns (obj):
    {
        endOfItems (bool): Whether there are remaining items that have yet to be retrieved
        items ([obj]): List of parent messages. See top of file for format
    }
*/
const getParentMessages = async function(userId, lastSeen)
{
    let query = `
                    SELECT messages.id, senderId, recipientId, title, body, status, TIMESTAMPDIFF(MINUTE, messages.createdAt, CURRENT_TIMESTAMP()) AS minutesSinceCreation, username AS sender
                    FROM messages
                    JOIN 
                        users ON messages.recipientId = users.id
                    WHERE 
                        recipientId = ? AND parentId IS NULL 
                        ${lastSeen ? "AND id < ?" : ""}
                    ORDER BY 
                        IF(status = 'unread', 0, 1), 
                        id DESC
                    LIMIT ?`;

    let params;
    if(lastSeen)
        params = [userId, lastSeen, CONFIG.MESSAGES_PER_PAGE + 1]
    else
        params = [userId, CONFIG.MESSAGES_PER_PAGE + 1]

    let messages = await queryDb(query, params);

    let endOfItems = true;
    if(messages.length > CONFIG.MESSAGES_PER_PAGE)
    {
        messages.pop();
        endOfItems = false;
    }

    return {endOfItems, items: messages};
}

/*
    Get the number of unread messages for a user.

    userId (int, required): ID of the user

    returns (int): Number of unread incoming messages.
*/
const getNumUnreadMessages = async function(userId)
{
    let results = await queryDb('SELECT COUNT(id) AS numUnreadMessages FROM messages WHERE recipientId = ? AND status = "unread"', [userId])
    return results[0];
}

/*
    Update a user's profile picture. Changes the PFP URL.

    userId (int, required): ID of the user whose profile picture will be updated.
    profileLink (profileLink, str): New PFP url.
*/
const setProfilePic = async function(userId, profileLink)
{
    await queryDb("UPDATE profiles SET profilePicture = ? WHERE id = ?", [profileLink, userId]);
}

/*
    Check if a username has been taken by either verified or unverified users.

    username (str, required): Username to check.

    return (bool): True if username has been taken.
*/
const checkIfUsernameTaken = async function(username)
{
    const usernameTaken = await queryDb(`
    SELECT 1
    WHERE EXISTS 
    (
        SELECT 1 FROM users WHERE username = ?
    )
    OR EXISTS 
    (
        SELECT 1 FROM unverifiedusers WHERE username = ?
    );`,
    [username, username]);

    return usernameTaken.length > 0;
}

/*
    Insert a new verification code into the DB.

    username (str, required): Name of the corresponding account
    verificationCode (str, required): The code that wil be stored 
*/
const insertAccountVerificationCode = async function(username, verificationCode)
{
    await queryDb(
        `INSERT INTO accountVerificationCodes (username, verificationCode) VALUES(?, ?)`,
        [username, verificationCode]
    )
    return;
}

/*
    Insert a new password reset code into the DB.

    username (str, required): Name of the corresponding account
    verificationCode (str, required): The code that wil be stored 
*/
const insertPasswordResetCode = async function(username, verificationCode)
{
    await queryDb(
        `INSERT INTO passwordresetcodes (username, resetCode) VALUES(?, ?)`,
        [username, verificationCode]
    )
    return;
}

/*
    Retrieve matching account verification codes for a user.

    username (str, required): Username of the account being verified.
    code (str, required): The verification code that must match for valid verification
    includeExpired (bool, optional, default: false): Set to true if expired codes should be included in the search.

    returns ([obj]): List of verification code objects with the following format:
    {
        id (int): ID of the verification code record
        username (str): Username of the associated account
        verificationCode (str): Retrieved code
        expiresAt (date): When the code expires.
    }
*/
const getMatchingAccountVerificationCodes = async function(username, code, includeExpired = false)
{
    let sql = `SELECT * from accountVerificationCodes WHERE username = ? AND verificationCode = ?`;
    if(!includeExpired)
    {
        sql += " AND expiresAt > NOW()"
    }

    const result = await queryDb(sql, [username, code])
    return result;
}

/*
    Retrieve all password reset codes for a user.

    username (str, required): Username of the account.
    includeExpired (bool, optional, default: false): Set to true if expired codes should be included in the search.

    returns ([obj]): List of password reset verification code objects with the following format:
    {
        id (int): ID of the verification code record
        username (str): Username of the associated account
        resetCode (str): Retrieved code
        expiresAt (date): When the code expires.
    }
*/
const getAllPasswordResetCodes = async function(username, includeExpired = false)
{
    if(!username) return [];

    let sql = `SELECT * from passwordresetcodes WHERE username = ?`;
    if(!includeExpired)
    {
        sql += " AND expiresAt > NOW()"
    }

    const result = await queryDb(sql, [username]);
    return result;
}

/*
    Retrieve matching password verification codes for a user.

    username (str, required): Username of the account being verified.
    code (str, required): The password verification code that must match for valid verification
    includeExpired (bool, optional, default: false): Set to true if expired codes should be included in the search.

    returns ([obj]): List of password verification code objects with the following format:
    {
        id (int): ID of the verification code record
        username (str): Username of the associated account
        resetCode (str): Retrieved code
        expiresAt (date): When the code expires.
    }
*/
const getMatchingPasswordResetCodes = async function({username, code, includeExpired = false})
{
    if(!username || !code) return [];

    let sql = `SELECT * from passwordresetcodes WHERE username = ? AND resetCode = ?`;
    if(!includeExpired)
    {
        sql += " AND expiresAt > NOW()"
    }

    const result = await queryDb(sql, [username, code])
    return result;
}

/*
    Delete any password reset codes belonging to a user.

    username (str, required): Username for the associated account
*/
const deletePasswordResetCodes = async function(username)
{
    await queryDb(`
                    DELETE FROM passwordResetRateLimits
                    WHERE username = ?`, [username]);
    return;
}

/*
    Retrieves the current rate limit for password reset attempts for a user.

    username (str, required): Username of the associated account

    returns (obj): The password reset attempt record. Has the following format:
    {
        id (int): ID of the reset attempt record
        username (str): Name of the account
        attemptCount (int): Amount of attempts made for the current interval
        firstAttempt (timestamp): Timestamp for when the first attempt was made
    }
*/
const getPasswordResetRateLimit = async function(username)
{
    const result = await queryDb(
        `SELECT id, username, attemptCount, unix_timestamp(firstAttempt) AS firstAttempt FROM passwordResetRateLimits WHERE username = ?`, [username]
    );

    return result;
}

/*
    Reset the amount of password reset attempts to 1 for a specific user

    username (str, required): Username of the associated account
*/
const resetRateLimitAttempts = async function(username)
{
    await queryDb(
                "UPDATE passwordResetRateLimits SET attemptCount = 1, firstAttempt = NOW() WHERE username = ?", 
                [username]);
    return;
}

/*
    Increment the amount of password reset attempts for a user

    username (str, required): Username of the associated account
*/
const incrementRateLimitAttempts = async function(username)
{
    await queryDb(
                "UPDATE passwordResetRateLimits SET attemptCount = attemptCount + 1 WHERE username = ?",
                [username]
    );
    return;
}

/*
    Insert a new user password reset attempt record

    username (str, required): Username of the associated account
*/
const insertUserRateLimit = async function(username)
{
    await queryDb(
                    `INSERT INTO passwordResetRateLimits (username, attemptCount, firstAttempt) VALUES (?, 1, NOW())`,
                    [username]
    );
    return;
}

/*
    Adds time to the expiration of a password reset code.

    username (str, required): Username that is associated with the reset code
    verificationCode (str, required): The verification code that will be extended
    timeInMinutes (int, optional, default: 20): The amount of time, in minutes, to extend the code by.
*/
const extendPasswordResetCodeExpiration = async function(username, verificationCode, timeInMinutes = 20)
{
    await queryDb(
                `UPDATE passwordresetcodes SET expiresAt = NOW() + INTERVAL ${timeInMinutes} MINUTE WHERE username = ? AND resetCode = ?`,
                [username, verificationCode]
    )
    return;
}

/*
    Lookup a user's permissions, if they have any.

    userId (int, required): ID of the user to lookup
    permission (str, optional): Permission type to lookup. Omitting this value will search for all perms.
    boardId (int, optional): ID of the board where the permissions are valid

    returns ([obj]):
    {
        permissionId (int): Unique ID for the permission entry
        userId (int): The account in question
        permission (str): Type of permission. Ex: "CONTENT" can delete content
        boardId (int): ID of the board where the permissions are valid
    }
*/
const getUserPermissions = async function({userId, permission, boardId})
{
    let query = "SELECT * FROM userpermissions WHERE userId = ?";
    let params = [userId]

    if(permission)
    {
        query += " AND permission = ?";
        params.push(permission);
    }

    if(boardId)
    {
        query += " AND (boardId = ? OR boardId IS NULL)";
        params.push(boardId);
    }

    const perms = await queryDb(query, params);
    return perms;
}

/*
    Insert a new user permission record into the DB.

    userId (int, required): ID of the user in question
    newPermission (str, required): String representing the permission (ex: "SITE_ADMIN")
    boardId (int, optional): The board ID identifies the scope of the user's permissions.
        Providing this value means the user's permissions are only valid for that specific board.
        An empty value signifies site wide permissions and should only be given to admins
*/
const insertUserPermissions = async function({userId, newPermission, boardId})
{
    if(boardId)
        await queryDb("INSERT INTO userpermissions (userId, permission, boardId) VALUES (?, ?, ?)",[userId, newPermission, boardId]);
    else
        await queryDb("INSERT INTO userpermissions (userId, permission) VALUES (?, ?)",[userId, newPermission]);

    return;
}

/*
    Creates and inserts a record indicating that a user has been banned.

    userToBanId (int, required): ID of the user being banned
    isSitewide (bool, optional, default: false): True if the ban is sitewide.
        A sitewide ban prevents a user from posting any data, and will prevent
        logins.
    boardId (bool, optional): If the ban isn't sitewide, this value must be specified.
        Specifying this number will ban the user from a specific board.
*/
const insertUserBan = async function({userToBanId, isSitewide, boardId})
{
    if(isSitewide)
    {
        await queryDb("INSERT INTO userBbans (userId, isSitewide) VALUES (?, true)", [userToBanId]);
    }
    else
        await queryDb("INSERT INTO userBans (userId, scope) VALUES (?, ?)", [userToBanId, boardId]);
}

/*
    Retrieve current account standing in regards to bans.

    userToCheckId (int, required): ID of the user to check
    boardId (int, optional): Providing this number means the function
        will only check if the user is banned specifically from that board.
        Omitting this value checks for a sitewide ban.

    returns ([obj]):
    {
        banId (int): ID of the ban record
        userId (int): ID of the user that was banned
        scope (int): Board ID that the user was banned from. Can be null.
        isSitewide (bool): Whether user was banned sitewide or not
    }
*/
const getUserBans = async function({userToCheckId, usernameToCheck, boardId})
{
    // Use either id or username to find user.
    let query = userToCheckId ? 
        "SELECT * FROM userBans WHERE userId = ?" :
        "SELECT userId, username, isSitewide, scope FROM userBans LEFT JOIN users on users.id = userId WHERE username = ?"

    let params = userToCheckId ? [userToCheckId] : [usernameToCheck]

    if(!boardId)
    {
        query += " AND isSitewide = true"
    }
    else
    {
        query += " AND scope = ?"
        params.push(boardId)
    }

    const results = await queryDb(query, params);
    return results;
}


module.exports = 
{
    getUserBans,
    insertUserBan,
    insertUserPermissions,
    getUserPermissions,
    getAllPasswordResetCodes,
    insertUserRateLimit,
    extendPasswordResetCodeExpiration,
    updateUserPassword, 
    deletePasswordResetCodes, 
    incrementRateLimitAttempts, 
    resetRateLimitAttempts, 
    getPasswordResetRateLimit, 
    getMatchingPasswordResetCodes, 
    insertPasswordResetCode, 
    deleteUnverifiedUser, 
    getMatchingAccountVerificationCodes, 
    insertAccountVerificationCode, 
    insertUnverifiedUser, 
    checkIfUsernameTaken, 
    setProfilePic, 
    setMessageStatus,
    getMessages, 
    getNumUnreadMessages, 
    getParentMessages, 
    insertMessage, 
    addVotes, 
    alterProfile, 
    queryProfiles, 
    insertProfile, 
    getExactUser, 
    getUserSubscriptionStatus, 
    subscribeToBoard, 
    unsubscribeToBoard, 
    getProfile, 
    insertUser, 
    getUserActivity, 
    getSubscribedBoards
};
