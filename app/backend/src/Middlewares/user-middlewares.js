const userService = require(baseDir + "/src/Services/user-service");

/*
    Enforces user authentication. User must have an active and valid session.
    Failure to authenticate will stop execution flow and return 401 status code.
*/
const requireAuthentication = async function(req, res, next) {
    if(!req.session.loggedIn)
    {
        res.status(401).send({error: "You must be logged in to do that."});
        return;
    }

    
    next();
}

/*
    Requires that a user has the permissions to moderate content (delete posts, comments, boards, etc.).
    Execution flow is stopped if user doesn't have perms.
*/
const requireModerationPerms = async function(req, res, next) {
    if (!req.session.loggedIn)
    {
        res.status(401).send({error: "You must be logged in to do that."});
        return;
    }
    const permissionRequest = await userService.checkUserPerms({userId: req.session.userID, requestedPerm: "MODERATION", boardScopeId: req.body.boardId});

    if(!permissionRequest.ok)
    {
        res.status(permissionRequest.statusCode).send(permissionRequest.error);
        return;
    }
    next();
}

/*
    Requires that a user has admin permissions to continue.
*/
const requireAdminPerms = async function(req, res, next) {
    if (!req.session.loggedIn)
    {
        res.status(401).send({error: "You must be logged in to do that."});
        return;
    }
    const adminPermissionRequest = await userService.checkUserPerms({userId: req.session.userID, requestedPerm: "SITE_ADMIN"})
    if(!adminPermissionRequest.ok)
    {
        res.status(adminPermissionRequest.statusCode).send(adminPermissionRequest.error);
        return;
    }
    next();
}

module.exports = {requireAuthentication, requireModerationPerms, requireAdminPerms };