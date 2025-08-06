const bcrypt = require("bcryptjs");
const userModel = require(baseDir + "/src/Models/user-model");
const postModel = require(baseDir + "/src/Models/post-model");
const commentModel = require(baseDir + "/src/Models/comment-model");
const boardModel = require(baseDir + "/src/Models/board-model");
const eventService = require(baseDir + "/src/Services/event-service");
const sessionModel = require(baseDir + "/src/Models/session-model");

const { sanitizeHtml } = require(baseDir + "/src/utils/sanitize");
const { generatePresignedUploadURL } =  require(baseDir + "/src/utils/r2Access");
const { purgeCacheUrl } =  require(baseDir + "/src/utils/cloudflare")
const { sendVerificationEmail, sendPasswordResetEmail } = require(baseDir + "/src/utils/emailUtility");
const { generateRandomString } = require(baseDir + "/src/utils/cryptoUtility")
const { getDecodedHtmlLength } = require(baseDir + "/src/utils/misc");

/*
    Given a username and password, authenticates an account.

    suppliedUsername (str, required): Username of the account to authenticate
    suppliedPassword (str, required): Password of the account to authenticate
    loginSession (obj, required): Current user session

    returns (obj):
        {
            ok (bool): false if error
            username (str): username of the account
            requiresVerification (bool): True if account needs to be verified
        }
*/
const authenticateUser = async function(suppliedUsername, suppliedPassword, loginSession) {
    //true to include unverified accounts in the search
    let user = (await userModel.getExactUser({username: suppliedUsername, includeUnverifiedUsers: true}));

    //Password mismatch
    if(!user || !(await bcrypt.compare(suppliedPassword, user.userPassword)))
    {
        return {ok: false, statusCode: 401, error: "User does not exist or password is incorrect"};
    }

    //Check if user is banned from site
    const bans = await userModel.getUserBans({ userToCheckId: user.id});
    if(bans.length > 0)
    {
        return {ok: false, statusCode: 403, error: "This account has been suspended"}
    }

    //Some accounts still require verification upon login
    if(!user.requires_verification)
    {
        logIn(user.username, user.id, loginSession);
    }
    else
    {
        issueAccountVerificationCode(user.username, false);
    }

    return {ok: true, username: user.username, requiresVerification: user.requires_verification}
};

/*
    Logs a user out by deleting user session. If provided a userId, it will
    delete the active session of that user, otherwise it will use loginSession.

    userId (int, optional): ID of the user whose session will be deleted.
    loginSession (obj, optional): The current user session to delete.
*/
const logOutUser = function({userId, loginSession, res}) {
    if(userId)
    {
        sessionModel.deleteSession(userId);
        return;
    }

    if(loginSession && loginSession.loggedIn && res)
    {
        loginSession.destroy();
        res.clearCookie('connect.sid', { path: '/' });
    }
}

/*
    Retrieve an account's board subscriptions.

    userId (int, required): ID of the current user
    lastSeen (int, optional): ID of the last seen subscription. This value is used
        to determine where to continue loading more subscriptions.

    returns (obj):
    {
        ok (bool): false if error
        data: Subscription data returned by userModel.getSubscribedBoards()
    }
*/
const getUserSubscriptions = async function(userId, lastSeen)
{
    if(!userId) return {ok: true, data: []};

    let result = await userModel.getSubscribedBoards(userId, lastSeen);
    return {ok: true, data: result};
}

/*
    Change the user's subscription status for a board.

    userId (int, required): ID of the user initiating the change
    boardId (int, required): ID of the board thats being changed
    isSubbed (bool, required): Current subscription status of the user and board

    returns (obj):
        {
            newSubscriptionStatus (bool): Status of the subscription after change.
            title (str): Title of the subscribed board
            boardPicture (str): IMG link of the board's picture
            id (int): ID of the board.
        }
*/
const changeUserSubscription = async function(userId, boardId, isSubbed)
{
    if(!userId || !boardId)
        return {ok: false, statusCode: 400, error: "Incorrect parameters provided."}

    if(isSubbed)
    {
        await userModel.unsubscribeToBoard(userId, boardId);
        await boardModel.addNumSubscribers(boardId, -1);
        return {newSubscriptionStatus: false};
    }
    else
    {
        await userModel.subscribeToBoard(userId, boardId);
        await boardModel.addNumSubscribers(boardId, 1);
        const subscribedBoard = await boardModel.getBoardData({boardId})

        return {newSubscriptionStatus: true, title: subscribedBoard.title, boardPicture: subscribedBoard.boardPicture, id: subscribedBoard.id};
    }
}

/*
    Issues a new account verification code. Saves the code to db and sends an email to the user's account
    with the code.

    username (str): Name of the account that needs to be verified

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const issueAccountVerificationCode = async function(username)
{
    const user = await userModel.getExactUser({username, includeUnverifiedUsers: true, includeVerifiedUsers: false})
    if(!user)
    {
        return {ok: false, statusCode:400, error: "Unable to find account."};
    }

    const verificationCode = generateRandomString(CONFIG.VERIFICATION_CODE_LENGTH);
    //Save code to db for later lookup upon verification
    await userModel.insertAccountVerificationCode(username, verificationCode);
    sendVerificationEmail(`noreply@${SECRETS.EMAIL_DOMAIN}`, user.email, verificationCode);

    return {ok: true};
}

/*
    Issues a new account verification code for password resets. Saves the code to db and sends 
    an email to the user's account with the code.

    username (str): Name of the account that needs to be verified

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const issuePasswordResetCode = async function(username)
{
    //Backoff if too many requests made.
    const currentPasswordCodes = await userModel.getAllPasswordResetCodes(username);
    if(currentPasswordCodes.length > CONFIG.MAX_CURRENT_PASSWORD_CODES)
    {
        return {ok: false, statusCode: 400, error: "Too many attempts have been made. Please try again later."};
    }

    const user = await userModel.getExactUser({username, includeUnverifiedUsers: true, includeVerifiedUsers: true});
    if(!user)
    {
        return {ok: false, statusCode: 400, error: "User doesn't exist."};
    }

    const verificationCode = generateRandomString(CONFIG.VERIFICATION_CODE_LENGTH);
    //Save code to db for later lookup upon verification
    await userModel.insertPasswordResetCode(username, verificationCode);
    sendPasswordResetEmail(`noreply@${SECRETS.EMAIL_DOMAIN}`, user.email, verificationCode);

    return {ok: true};
}


/*
    Checks if user has made too many attempts at verifying their password reset code.
    Too many attempts in a short period of time will lock the user out until the 
    interval expires.

    username (str, required): The username of the account attempting to verify their password reset code.

    returns (bool): True if user can proceed.
*/
const checkAndUpdatePasswordResetAttempts = async function(username)
{
    const rateLimitData = await userModel.getPasswordResetRateLimit(username);
    if(rateLimitData.length > 0)
    {
        const date = new Date(rateLimitData[0].firstAttempt * 1000);

        date.setMinutes(date.getMinutes() + CONFIG.PASSWORD_RESET_RATE_LIMIT_DURATION);

        const now = new Date();

        //If account has too many attempts within the time interval(starting at first attempt, ending at 
        //first attempt + CONFIG.PASSWORD_RESET_RATE_LIMIT_DURATION minutes),
        //then restrict further attempts until the interval has passed
        if(now < date)
        {
            if(rateLimitData[0].attemptCount > CONFIG.MAX_CURRENT_PASSWORD_CODE_ATTEMPTS)
            {
                return false;
            }
            await userModel.incrementRateLimitAttempts(username);
        }
        else //reset attempt count, and start new interval
        {
            await userModel.resetRateLimitAttempts(username);
        }
    }
    else
    {
        userModel.insertUserRateLimit(username);
    }
    return true;
}

/*
    Verifies that a password reset code is correct.

    username (str, required): Username of the account being verified
    verificationCode (str, required): The verification code to check

    returns (obj):
    {
        ok (bool): false if error
    }
*/
const verifyPasswordResetCode = async function(username, verificationCode)
{
    const userCanAttemptReset = await checkAndUpdatePasswordResetAttempts(username);
    if(!userCanAttemptReset)
    {
        return {ok: false, statusCode: 400, error: "Too many attempts. Try again later."}
    }

    const matchingCodes = await userModel.getMatchingPasswordResetCodes({username, code: verificationCode});
    if(matchingCodes.length < 1)
        return {ok: false, statusCode: 400, error: "Invalid or expired verification code."};

    return {ok: true};
}

/*
    Verifies a code, then extends the code's valid duration. The extension is necessary, because
    the client will resend the code after inputting the new password.

    username (str, required): Username of the account being verified
    verificationCode (str, required): The code to verify.

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const verifyAndExtendPasswordResetCode = async function(username, verificationCode)
{
    const userData = await userModel.getExactUser({username, includeUnverifiedUsers: true, includeVerifiedUsers: true});
    if(!userData)
    {
        return {ok: false, statusCode:400, error: "Unable to find account."};
    }

    const codeVerificationStatus = await verifyPasswordResetCode(username, verificationCode);
    if(!codeVerificationStatus.ok)
    {
        return codeVerificationStatus;
    }

    await userModel.extendPasswordResetCodeExpiration(username, verificationCode, 20);
    return {ok: true};
} 

/*
    Resets an account password. Requires the verification code to be sent with the new password.

    username (str, required): Username of the account being reset.
    verificationCode (str, required): Code that has to be verified before password reset
    newPassword (str, required): The new password

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const resetPassword = async function(username, verificationCode, newPassword)
{
    const userData = await userModel.getExactUser({username, includeUnverifiedUsers: true, includeVerifiedUsers: true});
    if(!userData)
    {
        return {ok: false, statusCode:400, error: "Unable to find account."};
    }

    const codeVerificationStatus = await verifyPasswordResetCode(username, verificationCode);
    if(!codeVerificationStatus.ok)
    {
        return codeVerificationStatus;
    }

    if(!isValidPassword(newPassword))
        return {ok: false, statusCode: 400, error: "Password does not meet requirements!"};

    //Invalidate all existing reset codes for user
    await userModel.deletePasswordResetCodes(username);

    //Hashes password
    let hashedPassword = await bcrypt.hash(newPassword, 10);

    //Update with new password
    await userModel.updateUserPassword(username, hashedPassword, !userData.userRequiresVerification);

    return {ok: true};
}

/*
    Verifies an account, which is required for all new accounts.

    username (str, required): The account being verified
    verificationCode (str, required): The code required to verify the account
    loginSession (obj, required): Current user session.
*/
const verifyAccount = async function(username, verificationCode, loginSession)
{
    const matchingCodes = await userModel.getMatchingAccountVerificationCodes(username, verificationCode);

    if(matchingCodes.length < 1)
    {
        return {ok: false, statusCode: 400, error: "Invalid or expired verification code."};
    }

    //Get account info for unverified user
    const unverifiedUser = await userModel.getExactUser({username, includeVerifiedUsers: false, includeUnverifiedUsers: true});
    if(!unverifiedUser)
    {
        return {ok: false, statusCode: 400, error: "Account doesn't exist or account already verified."}
    }

    //To verify: 
    //Move the user into the verified users table, create a profile, and invalidate all verification codes issued.

    const assignedId = await userModel.insertUser(unverifiedUser.email, unverifiedUser.username, unverifiedUser.userPassword);

    //Will also delete any issued verification codes
    await userModel.deleteUnverifiedUser(unverifiedUser.username);
    await userModel.insertProfile(assignedId);

    //Finally, log the user in
    logIn(username, assignedId, loginSession);
    return {ok: true}
}

/*
    Creates an unverified account. Unverified accounts have limited functionality.

    email (str, required): Email of the new account.
    username (str, required): Username of the new account
    password (str, required): Password of the new account

    returns (obj):
        {
            ok (bool): false if error
        }
*/
const createUnverifiedUser = async function(email, username, password)
{
    //Verify that our email, username, and password meets our minimum required format
    if(!isValidEmail(email))
        return {ok:false, statusCode: 400, error: "Not a valid email address."};

    if(!isValidUsername(username))
        return {ok: false, statusCode: 400, error: "Username does not meet requirements!"};

    if(!isValidPassword(password))
        return {ok: false, statusCode: 400, error: "Password does not meet requirements!"};


    //Checks if user already exists
    if(await userModel.checkIfUsernameTaken(username))
        return {ok: false, statusCode: 400, error: "Username already taken!"};


    //Hashes password
    let hashedPassword = await bcrypt.hash(password, 10);

    //User hasn't been verified yet, so insert their account information into a temporary unverified users table
    await userModel.insertUnverifiedUser(email, username, hashedPassword);

    //Issue a verification challenge
    await issueAccountVerificationCode(username, false);
    
    return {ok: true};
}

/*
    Retrieve a profile page, given a username.

    profileName (str, required): The profile to retrieve

    returns (obj):
        {
            ok (bool): false if error
            data (obj): Profile data returned by userModel.getProfile(). See user-model.js for format
        }
*/
const getProfilePage = async function(profileName)
{
    if(!profileName)
        return {ok: false, statusCode: 400, error: "No query provided"}

    if((await userModel.getUserBans({ usernameToCheck: profileName})).length > 0)
    {
        return {ok: false, statusCode: 403, error: "This account is suspended."}
    }

    let profile = (await userModel.getProfile({profileName})).items;

    if(profile.length < 1)
        return {ok: false, statusCode: 404, error: "Looks like that user doesn't exist."};

    return {ok: true, data: profile[0]};
}

/*
    Search for profiles that are similar to the profile name provided.

    profileName (str, required): The profile name to search for
    offset (int, required): Used to offset the list of results.

    returns (obj):
        {
            ok (bool): false if error
            data (obj): Profile data returned by userModel.queryProfiles. See user-model.js for more
        }
*/
const getMatchingProfilePages = async function(profileName, offset)
{
    if(profileName == undefined)
        return {ok: false, statusCode: 400, error: "No query provided"}

    let data = await userModel.queryProfiles(profileName.trim(), offset);

    if(data.error) return {ok: false, error: data.error};

    return {ok: true, data};
}

/*
    Return a profile's user activity, which consists of posts and comments.

    profileName (str, required): Name of the profile to retrieve
    curUserId (int, required): ID of the current user
    offset (int, optional): Offset that determines how many results to skip
    lastSeen (int, optional): ID of lastSeen post/comment. Any loaded results will use this as a starting point
    filter (str, optional): Filter method to sort results by
    timeFilter (str, optional): Filter date to sort results by

    returns (obj):
        {
            ok (bool): false if error
            userActivity (obj): Data returned by userModel.getUserActivity()
        }
*/
const getProfileFeed = async function({profileName, curUserId, offset, lastSeen, filter, timeFilter})
{
    if((await userModel.getUserBans({ usernameToCheck: profileName})).length > 0)
    {
        return {ok: false, statusCode: 403, error: "This account is suspended."}
    }

    let userActivity = await userModel.getUserActivity({profileName, userId: curUserId, offset, lastSeen, filter, timeFilter});
    return {ok: true, ...userActivity};
}

/*
    Logs a user in by setting their user session.

    username (str, required): username of the account
    id (int, required): ID of the account
    loginSession (obj, required): Current login session of the user
*/
const logIn = function(username, id, loginSession) {
    loginSession.user = username;
    loginSession.userID = id;
    loginSession.loggedIn = true;
}

/*
    Checks if email is using a valid format.

    email (str, required): Email to check

    returns (bool): True if email is valid; false otherwise
*/
const isValidEmail = function(email)
{
    if(email.length > CONFIG.MAX_LENGTH_EMAIL)
    {
        return false;
    }
    
    const emailValidation = /^\S+@\S+\.\S+$/;

    return emailValidation.test(email);
}

/*
    Checks if username is using a valid format.

    username (str, required): Username to validate

    returns (bool): True if username is valid; false otherwise
*/
const isValidUsername = function(username)
{
    //RegEx that checks if username is between 3 and 20 characters long, 
    //and only consists of the alphabet, numbers, underscores and dashes.
    const usernameValidation = new RegExp(`^[a-zA-Z0-9_-]{${CONFIG.MIN_LENGTH_USER_NAME},${CONFIG.MAX_LENGTH_USER_NAME}}$`);

    return usernameValidation.test(username);
}

/*
    Checks if password is valid, according to our restrictions.

    username (str, required): Password to validate.

    returns (bool): True if password is valid; false otherwise
*/
const isValidPassword = function(password)
{
    //RegEx that checks for at least one number
    const atLeastOneNum = new RegExp(".*[0-9].*");

    //RegEx that checks for at least one letter
    const atLeastOneAlpha = new RegExp(".*[a-zA-Z].*");

    //RegEx that checks for at least one of the following: [!, @, ., _, -]
    const atLeastOneSpecial = new RegExp(".*[!@._-].*");

    //RegEx that checks that the password is between 8 and 30 characters long,
    //contains only letters, numbers, and special characters
    const passwordValidation = new RegExp(`^[a-zA-Z0-9!@._-]{${CONFIG.MIN_LENGTH_PASSWORD},${CONFIG.MAX_LENGTH_PASSWORD}}$`)

    return passwordValidation.test(password) && atLeastOneAlpha.test(password) && atLeastOneNum.test(password) && atLeastOneSpecial.test(password);
}

/*
    Edit a user's profile.

    profileName (str, required): Name of the profile to edit
    curUserName (str, required): Name of the current user
    description (str, optional): The new description
    bio (str, optional): The new bio

    returns (obj):
        {
            ok (bool): false if error
            data (obj): 
            {
                description (str): The edited description
                bio (str): The edited bio
            }
        }
*/
const setProfile = async function(profileName, curUserName, description, bio)
{
    if(profileName != curUserName)
        return {ok: false, statusCode: 401, error: "Unauthorized User."}

    if(bio.length > (CONFIG.MAX_LENGTH_PROFILE_BIO * 3) || getDecodedHtmlLength(bio) > CONFIG.MAX_LENGTH_PROFILE_BIO)
        return {ok: false, statusCode: 400, error: `Bio length must be under ${CONFIG.MAX_LENGTH_PROFILE_BIO} characters.`}

    if(description.length > CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION)
        return {ok: false, statusCode: 400, error: `Description length must be under ${CONFIG.MAX_LENGTH_PROFILE_DESCRIPTION} characters.`}

    bio = sanitizeHtml({content: bio});

    await userModel.alterProfile(curUserName, description, bio);

    return {ok: true, data: {description, bio}};
}

/*
    Sends a message from one user to another. Messages can be a root (new message), or a reply to an 
    existing one.

    senderId (int, required): ID of the sender.
    recipientName (str, required): Username of the recipient
    title (str, required): Title of the message
    body (str, optional): Message text content
    parentId (int, optional): If this is a reply to an existing message, this parameter should be
        the ID of the root message

    returns (obj):
    {
        ok (bool): false if error
        data (int): ID of the recently sent message
    }

*/
const sendMessage = async function(senderId, recipientName, title, body, parentId)
{
    if(!senderId || !recipientName || !body) 
        return {ok: false, statusCode: 400, error: "Incorrect format"};

    if(!parentId && !title)
        return {ok: false, statusCode: 400, error: "Message must have a title."};

    if(!isValidUsername(recipientName))
        return {ok: false, statusCode: 400, error: "Unable to find recipient."};

    if(title && title.length > CONFIG.MAX_LENGTH_MESSAGE_TITLE)
        return {ok: false, statusCode: 400, error: `Title must be under ${CONFIG.MAX_LENGTH_MESSAGE_TITLE} characters.`};

    if(body.length > (CONFIG.MAX_LENGTH_MESSAGE_BODY * 3) || getDecodedHtmlLength(body) > CONFIG.MAX_LENGTH_MESSAGE_BODY)
        return {ok: false, statusCode: 400, error: `Body must be under ${CONFIG.MAX_LENGTH_MESSAGE_BODY} characters.`};

    if(body.length < 1)
        return {ok: false, statusCode: 400, error: `Body cannot be empty.`};

    body = sanitizeHtml({content: body});

    const recipientAccount = await userModel.getExactUser({username: recipientName});

    if(!recipientAccount) 
        return {ok: false, statusCode: 400, error: `Unable to find recipient.`};

    const insertId = await userModel.insertMessage(senderId, recipientAccount.id, title, body, parentId);

    await eventService.sendMessageToClient(recipientAccount.id, "NEW_MESSAGE")

    return {ok: true, data: insertId};
}

/*
    Retrieve a user's message inbox.

    userId (int, required): ID of the user 
    lastSeen (int, optional): Determines the starting point of the message results. ID of the last message
    messageType (str, required): Can be "inbox" for all incoming messages, or "sent" for outgoing messages

    returns (obj):
    {
        ok (bool): false if error
        data (obj): Message data returned by userModel.getMessages()
    }
*/
const getUserInbox = async function(userId, lastSeen, messageType)
{
    const results = await userModel.getMessages(userId, lastSeen, messageType);
    return {ok: true, data: results};
}

/*
    Retrieves the number of unread messages.

    userId (int, required): ID of the current user.

    returns (obj):
    {
        ok (bool): false if error
        data (int): Number of unread messages for this user
    }
*/
const getNumUnreadMessages = async function(userId)
{
    const results = await userModel.getNumUnreadMessages(userId);
    return {ok: true, data: results};
}

/*
    Sets a message status to read or unread.

    recipientId (int, required): ID of the user who will have their message status changed
    messageIds ([int], required): Array containing the IDs of the messages to modify
    newStatus (str, required): The new status of the messages. Can be "read" or "unread"

    returns (obj):
    {
        ok (bool): false if error
    }
*/
const setMessagesStatus = async function(recipientId, messageIds, newStatus)
{
    if(messageIds.length < 1)
    {
        return {ok: false, statusCode: 400, error: "Must include message ids."}
    }

    await userModel.setMessageStatus(recipientId, messageIds, newStatus);
    return {ok: true};
}

/*
    Retrieve a presigned URL that allows users to upload profile pictures.

    userId (int, required): ID of the user
    fileSize (int, required): Size of the file in bytes. 10,000,000(10MB) max.
    fileExtension (str, required): Extension of the image file. Supports "png" and "jpg" for now

    returns (obj):
    {
        ok (bool): false if error
        presignedURL (str): The upload URL endpoint.
    }
*/
const getPfPUploadURL = async function(userId, fileSize, fileExtension)
{
    if(fileSize > 10_000_000)
    {
        return {ok: false, statusCode: 400, error: "File size must be under 10MB."}
    }
    fileExtension = fileExtension.toLowerCase();
    if(fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg")
    {
        return {ok: false, statusCode: 400, error: "File must be jpg or png."};
    }

    const presignedURL = await generatePresignedUploadURL(`profiles/${userId}/profilePic.${fileExtension}`, `putObject`, SECRETS.R2_BUCKET_NAME, 3000);
    return {ok: true, presignedURL: presignedURL};
}

/*
    Confirms a PFP upload, meaning it purges any cloudflare caches and
    set the user's profile image to the newly uploaded one.

    userId (int, required): ID of the user who uploaded
    fileExtension (str, required): Extension of the image file. Supports "png" and "jpg" for now

    returns (obj):
    {
        ok (bool): false if error
        url (str): The image url of the new profile picture
    }
*/
const confirmPfPUpload = async function(userId, fileExtension)
{
    fileExtension = fileExtension.toLowerCase();
    if(fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg")
    {
        return {ok: false, statusCode: 400, error: "File must be jpg or png"};
    }

    let fileUrl = `${SECRETS.R2_URL}/profiles/${userId}/profilePic.${fileExtension}`;
    await purgeCacheUrl([fileUrl]);

    fileUrl += `?t=${Date.now()}`;

    await userModel.setProfilePic(userId, fileUrl);

    return {ok: true, url: fileUrl};
}

/*
    Checks if a user has a specific permission.

    userId (int, required): ID of the user to check
    requestedPerm (str, required): The requested permission to look for

    returns (obj):
    {
        ok (bool): True if user has the requested permission.
    }
*/
const checkUserPerms = async function({userId, requestedPerm, boardScopeId})
{
    const perms = await userModel.getUserPermissions({userId, permission: requestedPerm, boardId: boardScopeId});

    if (perms.length > 0)
        return {ok: true};
    else
        return {ok: false, statusCode: 401, error: "You do not have adequate permissions to do that."}
}

/*
    Bans a user. Users can either be banned from a specific board, or sitewide.

    userToBanId (int, required): ID of the user to ban
    boardId (int, optional): ID of the board to ban the user from. Required if
        isSitewide = false
    isSitewide (bool, optional, default: false): Set to true if ban should apply
        sitewide
*/
const issueUserBan = async function({userToBanId, boardId, isSitewide = false})
{
    if (!Number.isInteger(userToBanId) || (!Number.isInteger(boardId) && !isSitewide))
    {
        return {ok: false, statusCode: 400, error: "Invalid paramters."}
    }


    await userModel.insertUserBan({userToBanId, boardId, isSitewide});
    if(isSitewide)
    {
        commentModel.markUserCommentsAsDeleted(userToBanId);
        postModel.markUserPostsAsDeleted(userToBanId);
        logOutUser({userId: userToBanId});
    }
    return {ok: true};
}


module.exports = 
{
    issueUserBan,
    checkUserPerms,
    verifyAndExtendPasswordResetCode,
    resetPassword, 
    issuePasswordResetCode, 
    issueAccountVerificationCode, 
    verifyAccount, 
    confirmPfPUpload, 
    getPfPUploadURL, 
    setMessagesStatus, 
    getNumUnreadMessages, 
    getUserInbox,
    sendMessage,
    getUserSubscriptions, 
    setProfile, 
    getMatchingProfilePages,  
    authenticateUser, 
    logOutUser, 
    changeUserSubscription, 
    createUnverifiedUser, 
    getProfilePage, 
    getProfileFeed
};