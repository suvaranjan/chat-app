const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/allusers', authMiddleware, userController.allUsers);
router.get('/user', authMiddleware, userController.getUser);
router.post('/send-friend-req/:friendId', authMiddleware, userController.sendFriendRequest);
router.post('/accept-friend-req/:friendId', authMiddleware, userController.acceptFriendRequest);
router.post('/reject-friend-req/:friendId', authMiddleware, userController.rejectFriendRequest);
router.post('/delete-friend/:friendId', authMiddleware, userController.deleteFriend);

// New route for updating user status
router.put('/update-user-status', authMiddleware, userController.updateUserStatus);
router.get('/get-user-status', authMiddleware, userController.getUserStatus);
router.post('/update-user-profile', authMiddleware, userController.profileUpdate);


module.exports = router;