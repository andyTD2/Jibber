const clients = new Map();

/*
    Add client to map. The key is the clientID, and the value is a response obj, which 
    allows us to send data to clients

    clientId (int, required): ID of the client
    res (obj, required): The response object
*/
const addClient = function(clientId, res)
{
    clients.set(clientId, res);
}

/*
    Remove client from map.

    clientId (int, required): ID of the client to remove
*/
const removeClient = function(clientId) 
{
    clients.delete(clientId);
}

/*
    Registers a new client. Registering a new client means they are subscribed to server events.
    This allows the server to send the client messages without a corresponding client request.

    userId (int, required): ID of the user
    req (obj, required): The req object for the registration request
    res (obj, required): The response object for the registration request

*/
const registerNewClient = function(userId, req, res)
{
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', CONFIG.BASE_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow cookies
    res.flushHeaders(); // flush the headers to establish SSE with client

    addClient(userId, res);

    sendMessageToClient(userId, "Successfully subscribed to server events", "status");

    //Deregister when client "disconnects"
    req.on('close', () => {
        removeClient(userId);
        res.end();
    });
}

/*
    Send a message to a registered client.

    clientId (int, required): ID of the user to send a message to
    message (str, required): Content of the message to send.
    type (str, optional, default: "notification"): The type of message to send.
        Used by the client to determine how to handle the message.
*/
const sendMessageToClient = function(clientId, message, type="notification") 
{
    const client = clients.get(clientId);
    if (client)
        client.write(`data: ${JSON.stringify({ type, message })}\n\n`);
}

module.exports = {sendMessageToClient, addClient, removeClient, registerNewClient}