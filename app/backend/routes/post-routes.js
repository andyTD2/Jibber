"use strict";
const express = require('express');
const router = express.Router({mergeParams: true});
const { getFilter } = require(baseDir + "/src/Middlewares/misc-middlewares");
const { requireAuthentication, requireModerationPerms } = require(baseDir + "/src/Middlewares/user-middlewares");

const postController = require(baseDir + "/src/Controllers/post-controller");
const postMiddlewares = require(baseDir + "/src/Middlewares/post-middlewares");
const boardMiddlewares = require(baseDir + "/src/Middlewares/board-middlewares");

const commentController = require(baseDir + "/src/Controllers/comment-controller")

router.use("/newPost", requireAuthentication);
router.post("/newPost", postController.handleNewPostRequest);

router.get("/:postId/comments", commentController.handleLoadCommentsRequest);

router.use("/:postId/newComment", requireAuthentication);
router.post("/:postId/newComment", commentController.handleNewCommentRequest);

router.use("/:postId", postMiddlewares.getPost);
router.get("/:postId", postController.handlePostPageRequest);


module.exports = router;