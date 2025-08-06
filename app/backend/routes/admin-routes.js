const express = require('express');
const router = express.Router();

const { requireAuthentication, requireModerationPerms } = require(baseDir + "/src/Middlewares/user-middlewares");

const userController = require(baseDir + "/src/Controllers/user-controller");
const userMiddlewares = require(baseDir + "/src/Middlewares/user-middlewares");
const postController = require(baseDir + "/src/Controllers/post-controller");
const commentController = require(baseDir + "/src/Controllers/comment-controller");
const boardController = require(baseDir + "/src/Controllers/board-controller");

router.use("/deletePost", requireAuthentication);
router.use("/deletePost", requireModerationPerms);
router.post("/deletePost", postController.handleDeletePostRequest);

router.use("/deleteComment", requireAuthentication)
router.use("/deleteComment", requireModerationPerms)
router.post("/deleteComment", commentController.handleDeleteCommentRequest)

router.use('/banUser', userMiddlewares.requireAdminPerms);
router.post('/banUser', userController.handleSitewideUserBanRequest);

router.use('/banUserFromBoard', userMiddlewares.requireModerationPerms);
router.post('/banUserFromBoard', userController.handleBoardUserBanRequest);

router.use('/banBoard', userMiddlewares.requireAdminPerms);
router.post('/banBoard', boardController.handleDeleteBoardRequest);


module.exports = router