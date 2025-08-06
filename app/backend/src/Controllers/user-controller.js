"use strict";

const userService = require(baseDir + "/src/Services/user-service");

/*
    Handles requests for retrieving user subscriptions
    - requires active user session

    queryParam args:
        lastSeen (int, required): ID of the last seen subscription. Used to determine which subscriptions
            to load next
*/
const handleSubscriptionsRequest = async function(req, res)
{
    const subscriptions = await userService.getUserSubscriptions(req.session.userID, req.query.lastSeen);
    if(!subscriptions.ok)
    {
        res.status(subscriptions.statusCode).send({error: subscriptions.error});
        return;
    }

    res.status(200).send(subscriptions.data);
    return;
}

/*
    Handles session authentication requests. Authenticated users
    will receive information about their profile
*/
const handleSessionAuthCheck = async function(req, res) {
    const headers = {
        'X-Forwarded-For': req.headers['x-forwarded-for'],
        'X-Forwarded-Proto': req.headers['x-forwarded-proto'],
        'X-Forwarded-Host': req.headers['x-forwarded-host'],
    }

    if(req.session.loggedIn)
    {
        const userProfile = await userService.getProfilePage(req.session.user);
        const adminPerms = await userService.checkUserPerms({userId: req.session.userID, requestedPerm: "SITE_ADMIN"});
        res.status(200).send({user: req.session.user, profilePicture: userProfile.data.profilePicture, admin: adminPerms.ok});
        return;
    }
    res.status(401).send();
}

/*
    Handles user authentication (logins). Assigns a session upon success

    body args:
        username (str, required): Name of the user logging in
        password (str, required): Password of the user logging in
*/
const handleAuthRequest = async function(req, res) {
    const authStatus = await userService.authenticateUser(req.body.username, req.body.password, req.session);

    if(!authStatus.ok)
    {
        res.status(authStatus.statusCode).send({error: authStatus.error});
    }
    else
    {
        res.status(200).send({user: authStatus.username, requiresVerification: authStatus.requiresVerification});
    }
};

/*
    Handles user requests to log out.
    - requires active user session
*/
const handleLogOutRequest = function(req, res)
{
    userService.logOutUser({loginSession: req.session, res});
    res.status(200).send({status: "success"});
}

/*
    Handles requests for new account creation

    body args:
        email (str, required): Email of the new account
        username (str, required): Username for the new account
        password (str, required): Password for the new account
*/
const handleNewUserRequest = async function(req, res)
{
    let newUser = await userService.createUnverifiedUser(req.body.email, req.body.username, req.body.password, req.session);
    if (!newUser.ok)
    {
        res.status(newUser.statusCode).send({error: newUser.error});
        return;
    }
    res.status(200).send({username: req.body.username});
}

/*
    Handles requests to verify accounts.

    body args:
        username (str, required): Username for the account being verified
        verificationCode (str, required): The code that is required for verification
*/
const handleUserVerificationRequest = async function(req, res)
{
    const verificationStatus = await userService.verifyAccount(req.body.username, req.body.verificationCode, req.session);
    if(!verificationStatus.ok)
    {
        res.status(verificationStatus.statusCode).send({error: verificationStatus.error});
        return;
    }

    res.status(200).send({status: "Verification complete"});
}

/*
    Handles requests for new verification codes.

    body args:
        username (str, required): Username for the account being verified
*/
const handleNewVerificationCodeRequest = async function(req, res)
{
    const codeRequestStatus = await userService.issueAccountVerificationCode(req.body.username);

    if(!codeRequestStatus.ok)
    {
        res.status(codeRequestStatus.statusCode).send({error: codeRequestStatus.error});
        return;
    }

    res.status(200).send({status: "New verification code issued.", timeSent: new Date()})
}

/*
    Handles requests for password resets

    body args:
        username (str, required): The username for the account that needs its password reset
*/
const handleNewPasswordResetCodeRequest = async function(req, res)
{
    const codeRequestStatus = await userService.issuePasswordResetCode(req.body.username);

    if(!codeRequestStatus.ok)
    {
        res.status(codeRequestStatus.statusCode).send({error: codeRequestStatus.error});
        return;
    }

    res.status(200).send({status: "New verification code issued.", timeSent: new Date(), username: req.body.username})
}

/*
    Handles verification of password reset codes.

    body args:
        username (str, required): The username of the account for which the password is being reset
        verificationCode (str, required): The code that is required for account verification
*/
const handlePasswordResetCodeVerification = async function(req, res)
{
    const codeVerificationStatus = await userService.verifyAndExtendPasswordResetCode(req.body.username, req.body.verificationCode);

    if(!codeVerificationStatus.ok)
    {
        res.status(codeVerificationStatus.statusCode).send({error: codeVerificationStatus.error});
        return;
    }

    res.status(200).send({status: "Code verified", verificationCode: req.body.verificationCode});
}

/*
    Handles password resets

    body args:
        username (str, required): The username of the account that needs a password reset
        verificationCode (str, required): Code to verify account ownership (also used in previous step)
        newPassword (str, required): The account's new password
*/
const handlePasswordResetRequest = async function(req, res)
{
    const passwordResetStatus = await userService.resetPassword(req.body.username, req.body.verificationCode, req.body.newPassword);
    
    if(!passwordResetStatus.ok)
    {
        res.status(passwordResetStatus.statusCode).send({error: passwordResetStatus.error});
        return;
    }

    res.status(200).send({status: "Password reset successful."});
}

/*
    Handles requests to retrieve a profile.

    URL param args:
        profileName (str, required): The name of the profile being requested.
*/
const handleProfilePageRequest = async function(req, res)
{
    let profile = await userService.getProfilePage(req.params.profileName);

    if(!profile.ok)
    {
        res.status(profile.statusCode).send({error: profile.error});
        return;
    }

    res.status(200).send(profile.data);
}

/*
    Handles requests for retrieving a profile's post and comment history.

    URL param args:
        profileName (str, required): The name of the profile being requested

    queryParam args:
        offset (int, required): The user history feed offset. Used for pagination (ie., offset of 20 means skip first 20)
        lastSeen (int, required): ID for last seen user history post or comment. Any additional items will be from a date
            after item's date
        filter (str, optional): Filter to sort the user history by
        t (str, optional): Date filter to sort the user history by
*/
const handleProfileFeedRequest = async function(req, res)
{
    let data = await userService.getProfileFeed({
                                                    profileName: req.params.profileName, 
                                                    curUserId: req.session.userID,
                                                    offset: req.query.offset,
                                                    lastSeen: req.query.lastSeen,
                                                    filter: req.query.filter,
                                                    timeFilter: req.query.t
                                                })

    if(!data.ok)
    {
        res.status(data.statusCode).send({error: data.error});
        return;
    }

    res.status(200).send(data);
}

/*
    Handles requests for profile searches

    queryParam args:
        q (str, required): The search query to match
        offset (int, optional): Optional offset to skip the first x results
*/
const handleProfileSearchRequest = async function(req, res)
{
    let queryResults = await userService.getMatchingProfilePages(req.query.q, req.query.offset);
    if(!queryResults.ok)
    {
        res.status(queryResults.statusCode).send(queryResults.error);
        return;
    }
    res.status(200).send(queryResults.data);
}

/*
    Handles requests to change a user subscription.
    - requires active user session

    body args:
        boardId (int, required): The ID of the board to change subscription for
        currentSubscription (bool, required): Whether or not the user is currently subscribed
*/
const handleSubscriptionChangeRequest = async function(req, res)
{
    let subscription = await userService.changeUserSubscription(req.session.userID, req.body.boardId, req.body.currentSubscription);
    res.status(200).send(subscription);
}

/*
    Handles requests to edit profiles.
    - requires active user session

    URL param args:
        profileName (str, required): Name of the profile being edited

    body args:
        description (str, optional): New profile description
        bio (str, optional): New profile bio
*/
const handleProfileEditRequest = async function(req, res)
{
    const profileEdit = await userService.setProfile(req.params.profileName, req.session.user, req.body.description, req.body.bio);
    if(!profileEdit.ok)
    {
        res.status(profileEdit.statusCode).send({error: profileEdit.error});
        return;
    }

    res.status(200).send(profileEdit.data);
}

/*
    Handles requests to send messages.
    - requires active user session

    body args:
        recipient (str, required): The message recipient's username
        title (str, required): Title of the message
        body (str, optional): Text content of the message
        parentId (int, optional): If the message is a reply to an existing message, parentId identifies the ID
            of the parent message (one being responded to)

*/
const handleSendMessageRequest = async function(req, res)
{
    const messageStatus = await userService.sendMessage(req.session.userID, req.body.recipient, req.body.title, req.body.body, req.body.parentId);
    if(!messageStatus.ok)
    {
        res.status(messageStatus.statusCode).send({error: messageStatus.error});
        return;
    }

    res.status(200).send(messageStatus.data);
    return;
}

/*
    Handles requests to retrieve a user's inbox.
    - requires active user session

    queryParam args:
        lastSeen (int, optional): The ID of the last seen message. Any messages loaded will have been
            sent after the date of this message.

        type (str, required): Can be "inbox" or "sent". Signifies whether to retrieve outgoing or incoming
            messages
*/
const handleInboxRequest = async function(req, res)
{
    const messages = await userService.getUserInbox(req.session.userID, req.query.lastSeen, req.query.type);
    if(!messages.ok)
    {
        res.status(messages.statusCode).send(messages.error);
        return;
    }

    res.status(200).send(messages.data);
    return;
}

/*
    Handles requests to set message read status.
    - requires active user session

    body args:
        messageIds ([int], required): An array containing the message ids to adjust status for
        newStatus (str, required): Set the status of the message to this. Accepts "read" or "unread"
*/
const handleSetMessagesStatusRequest = async function(req, res)
{
    let setMessagesStatusRequest = await userService.setMessagesStatus(req.session.userID, req.body.messageIds, req.body.newStatus);
    if(!setMessagesStatusRequest.ok)
    {
        res.status(setMessagesStatusRequest.statusCode).send(setMessagesStatusRequest.error);
        return;
    }
    res.status(200).send({status: "success"});
    return;
}

/*
    Handles requests to retrieve message notifications.
    - requires active user session
*/
const handleMessageNotificationsRequest = async function(req, res)
{
    const numNotificationsRequest = await userService.getNumUnreadMessages(req.session.userID);
    if(!numNotificationsRequest.ok)
    {
        res.status(numNotificationsRequest.statusCode).send(numNotificationsRequest.error);
        return;
    }

    res.status(200).send(numNotificationsRequest.data);
    return;
}

/*
    Handles requests to retrieve presigned urls, which allow users to upload new profile pictures.
    - requires active user session

    body args:
        fileSize (int, required): Size, in bytes, of the file. Max 10,000,000 (10MB)
        fileExtension (str, required): Extension of the image. Supports "png" and "jpg"
*/
const handleUserProfilePicPresignedUrlRequest = async function(req, res)
{
    const presignedURLRequest = await userService.getPfPUploadURL(req.session.userID, req.body.fileSize, req.body.fileExtension);
    if(!presignedURLRequest.ok)
    {
        res.status(presignedURLRequest.statusCode).send(presignedURLRequest.error);
    }

    res.status(200).send({status: "OK", data: presignedURLRequest});
}

/*
    Handles requests to confirm a pfp upload (purge caches and changes user's profile pic).
    - requires active user session
    - should only occur after user uploads pfp. handleUserProfilePicPresignedUrlRequest() should be a precursor

    body args:
        fileExtension (str, required): Extension of the image. Supports "png" and "jpg"
*/
const handlePfPUploadConfirmationRequest = async function(req, res)
{
    const confirmUploadRequest = await userService.confirmPfPUpload(req.session.userID, req.body.fileExtension);
    if(!confirmUploadRequest.ok)
    {
        res.status(confirmUploadRequest.statusCode).send(confirmUploadRequest.error);
        return;
    }

    res.status(200).send({url: confirmUploadRequest.url});
    
}

/*
    Handles requests to ban users from a board.
    - requires active user session
    - requires moderator perms

    body args:
        userToBanId (int, required): ID of the user who will be banned
        boardId (int, required): ID of the board that the user will be banned from
*/
const handleBoardUserBanRequest = async function(req, res)
{
    const banUserFromBoardRequest = await userService.issueUserBan({userToBanId: req.body.userToBanId, boardId: req.body.boardId});

    if(!banUserFromBoardRequest.ok)
    {
        res.status(banUserFromBoardRequest.statusCode).send(banUserFromBoardRequest.error);
        return;
    }

    res.status(200).send({status: "SUCCESS"});
}

/*
    Handles requests to ban users SITEWIDE.
    - requires active user session
    - requires admin perms

    body args:
        userToBanId (int, required): ID of the user who will be banned
*/
const handleSitewideUserBanRequest = async function(req, res)
{
    const banUserRequest = await userService.issueUserBan({userToBanId: req.body.userToBanId, isSitewide: true});

    if(!banUserRequest.ok)
    {
        res.status(banUserRequest.statusCode).send(banUserRequest.error);
        return;
    }

    res.status(200).send({status: "SUCCESS"});
}

module.exports = 
{
    handleSitewideUserBanRequest,
    handleBoardUserBanRequest,
    handlePasswordResetCodeVerification,
    handlePasswordResetRequest,
    handleNewPasswordResetCodeRequest, 
    handleNewVerificationCodeRequest, 
    handleUserVerificationRequest, 
    handlePfPUploadConfirmationRequest, 
    handleUserProfilePicPresignedUrlRequest, 
    handleSetMessagesStatusRequest, 
    handleMessageNotificationsRequest, 
    handleInboxRequest, 
    handleSendMessageRequest, 
    handleSubscriptionsRequest, 
    handleProfileEditRequest, 
    handleProfileSearchRequest, 
    handleSessionAuthCheck, 
    handleAuthRequest, 
    handleLogOutRequest, 
    handleSubscriptionChangeRequest, 
    handleNewUserRequest, 
    handleProfilePageRequest, 
    handleProfileFeedRequest
};