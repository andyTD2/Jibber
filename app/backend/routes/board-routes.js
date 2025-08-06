"use strict";
const express = require('express');
const router = express.Router();

const db = require(baseDir + "/src/utils/db");

const posts = require(baseDir + "/routes/post-routes");
const commentController = require(baseDir + "/src/Controllers/comment-controller");
const postController = require(baseDir + "/src/Controllers/post-controller");

const { getFilter } = require(baseDir + "/src/Middlewares/misc-middlewares");
const { requireAuthentication } = require(baseDir + "/src/Middlewares/user-middlewares");

const boardMiddlewares = require(baseDir + "/src/Middlewares/board-middlewares");
const boardController = require(baseDir + "/src/Controllers/board-controller");


router.get("/search", postController.handleSearchResultsRequest);

router.get("/getSystemMessage", boardController.handleSystemMessageRequest);

router.get("/searchBoards", boardController.handleBoardSearchRequest);

router.get("/popularBoards", boardController.handlePopularBoardsRequest);

router.use("/createBoard", requireAuthentication);
router.post("/createBoard", boardController.handleNewBoardRequest);

router.use("/b/:board", boardMiddlewares.loadBoardData);
router.use("/b/:board", boardMiddlewares.getModeratorAuthStatus);
router.use("/b/:board", boardMiddlewares.requireBoardPrivledges);

router.use("/b/:board/post/", posts);

router.use("/b/:board/feed", getFilter);
router.get("/b/:board/feed", boardController.handleBoardFeedRequest);

router.use("/b/:board/edit", requireAuthentication);
router.use("/b/:board/edit", boardMiddlewares.requireModeratorPrivledges);
router.post("/b/:board/edit", boardController.handleEditBoardRequest);

router.use("/b/:board/uploadBoardPic", requireAuthentication);
router.use("/b/:board/uploadBoardPic", boardMiddlewares.requireModeratorPrivledges);
router.post("/b/:board/uploadBoardPic", boardController.handleBoardPicPresignedUrlRequest);

router.use("/b/:board/confirmBoardPicUpload", requireAuthentication);
router.use("/b/:board/confirmBoardPicUpload", boardMiddlewares.requireModeratorPrivledges);
router.post("/b/:board/confirmBoardPicUpload", boardController.handleBoardPicUploadConfirmationRequest);

router.use("/b/:board", getFilter);
router.get("/b/:board", boardController.handleBoardRequest);

router.use("/vote/:postId", requireAuthentication);
router.post("/vote/:postId", postController.handlePostVoteRequest);

router.use("/voteComment/:commentId", requireAuthentication);
router.post("/voteComment/:commentId", commentController.handleCommentVoteRequest);

router.get("/feed", boardController.handleBoardFeedRequest);

router.use("/", getFilter);
router.get("/", boardController.handleBoardRequest);





module.exports = router;