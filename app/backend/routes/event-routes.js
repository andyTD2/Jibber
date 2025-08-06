const express = require('express');
const router = express.Router();

const userMiddlewares = require(baseDir + "/src/Middlewares/user-middlewares");
const eventController = require(baseDir + "/src/Controllers/event-controller");

router.use("/events", userMiddlewares.requireAuthentication);
router.get("/events", eventController.handleRegisterClientRequest);

module.exports = router;