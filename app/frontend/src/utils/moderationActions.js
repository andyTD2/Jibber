import { postData } from "./fetch.js"
import CONFIG from "../config.js"

export const banUser = (targetUserId, boardId, onSuccess) => 
{
    postData({
        baseRoute: `${CONFIG.API_URL}/admin/banUserFromBoard`,
        body: {
            userToBanId: targetUserId,
            boardId: boardId
        },
        onSuccess
    })
}

export const banUserSitewide = (targetUserId, onSuccess) => 
{
    postData({
        baseRoute: `${CONFIG.API_URL}/admin/banUser`,
        body: {
            userToBanId: targetUserId
        },
        onSuccess
    })
}

export const deletePost = (targetPostId, boardId, onSuccess) => 
{
    postData({
        baseRoute: `${CONFIG.API_URL}/admin/deletePost`,
        body: {
            postId: targetPostId,
            boardId: boardId
        },
        onSuccess
    })
}

export const deleteComment = (targetCommentId, onSuccess) => 
{
    postData({
        baseRoute: `${CONFIG.API_URL}/admin/deleteComment`,
        body: {
            commentId: targetCommentId
        },
        onSuccess
    })
}

export const banBoard = (boardId, onSuccess) => 
{
    postData({
        baseRoute: `${CONFIG.API_URL}/admin/banBoard`,
        body: {
            boardId: boardId
        },
        onSuccess
    })
}