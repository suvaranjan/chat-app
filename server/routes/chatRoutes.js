const express = require('express');
const router = express.Router();
const chatController = require('./../controller/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/chat/:chatId', authMiddleware, chatController.getChat);

router.post('/chat/send-message/:chatId', authMiddleware, chatController.sendMessage);

router.post('/create-group', authMiddleware, chatController.createGroup);

router.post('/update-group-profile', authMiddleware, chatController.groupProfileUpdate);

router.post('/all-message-seen/:chatId', authMiddleware, chatController.allMessageSeen);

router.post('/add-members-to-group', authMiddleware, chatController.addMembersToGroup);

router.post('/remove-member-from-group', authMiddleware, chatController.removeMemberFromGroup);

router.post('/make-admin', authMiddleware, chatController.makeAdmin);

router.post('/exit-group', authMiddleware, chatController.groupExit);

router.get('/all-msg-seen/:chatId', authMiddleware, chatController.allMessageSeen);

router.post('/seen-new-messages', authMiddleware, chatController.messagesSeenByIds);

router.post('/get-group-chat', authMiddleware, chatController.getGroupAndChatDetails);

module.exports = router;