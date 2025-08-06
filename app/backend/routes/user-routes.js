"use strict";
const express = require('express');
const router = express.Router();
const userController = require(baseDir + "/src/Controllers/user-controller");
const userMiddlewares = require(baseDir + "/src/Middlewares/user-middlewares");

router.get('/me', userController.handleSessionAuthCheck);

router.get("/getConfig", (req, res) => {res.status(200).send(config)});

router.get("/subscriptions", userController.handleSubscriptionsRequest);

router.use("/uploadProfilePic", userMiddlewares.requireAuthentication);
router.post("/uploadProfilePic", userController.handleUserProfilePicPresignedUrlRequest);

router.use("/confirmProfilePicUpload", userMiddlewares.requireAuthentication);
router.post("/confirmProfilePicUpload", userController.handlePfPUploadConfirmationRequest);

router.get('/userLogout', userController.handleLogOutRequest);

router.post('/userLogin', userController.handleAuthRequest);

router.post('/userSignup', userController.handleNewUserRequest);

router.post('/userVerification', userController.handleUserVerificationRequest);

router.post('/getVerficationCode', userController.handleNewVerificationCodeRequest);

router.post('/getPasswordResetCode', userController.handleNewPasswordResetCodeRequest);

router.post('/passwordResetCodeVerification', userController.handlePasswordResetCodeVerification);

router.post(`/passwordReset`, userController.handlePasswordResetRequest);

router.use('/changeSubscription', userMiddlewares.requireAuthentication);
router.post('/changeSubscription', userController.handleSubscriptionChangeRequest);

router.use("/setMessageStatus", userMiddlewares.requireAuthentication);
router.post("/setMessageStatus", userController.handleSetMessagesStatusRequest);

router.use("/sendMessage", userMiddlewares.requireAuthentication);
router.post("/sendMessage", userController.handleSendMessageRequest);

router.use("/inbox", userMiddlewares.requireAuthentication);
router.get("/inbox", userController.handleInboxRequest);

router.get("/searchUsers", userController.handleProfileSearchRequest);

router.use("/notifications", userMiddlewares.requireAuthentication);
router.get("/notifications", userController.handleMessageNotificationsRequest);

router.get("/u/:profileName/feed", userController.handleProfileFeedRequest);

router.use("/u/:profileName/edit", userMiddlewares.requireAuthentication);
router.post("/u/:profileName/edit", userController.handleProfileEditRequest);

router.get("/u/:profileName", userController.handleProfilePageRequest);

module.exports = router;