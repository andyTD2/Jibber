const eventService = require(baseDir + "/src/Services/event-service");

/*
    Handles requests for registering a new client event.

    - requires active user session
*/
const handleRegisterClientRequest = async function(req, res)
{
    eventService.registerNewClient(req.session.userID, req, res);
}

module.exports = {handleRegisterClientRequest}