const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Group = require("../models/Group");
const { createUserCountList } = require("../helper/helper");

const allUsers = async (req, res) => {
    try {
        console.log(req.user);
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        // Select only the desired fields in the projection
        const users = await User.find(keyword, 'name email avatar _id').find({ _id: { $ne: req.user._id } });
        res.send(users);
    } catch (error) {
        console.log('Error during user search:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};


const sendFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user._id);

        // Check if the user and friendId are valid
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ msg: 'Friend not found' });
        }

        // Check if a friend request has already been sent
        if (user.friendRequestsSent.includes(friendId)) {
            return res.status(400).json({ msg: 'Friend request already sent' });
        }

        // Check if the user is already friends with the potential friend
        if (user.friends.some(f => f.friend.equals(friendId))) {
            return res.status(400).json({ msg: 'Already friends with this user' });
        }

        // Add the friendId to the user's sent friend requests
        user.friendRequestsSent.push(friendId);

        // Add the user's ID to the potential friend's received friend requests
        friend.friendRequestsReceived.push(req.user._id);

        // Save both the user and the potential friend with the updated friend requests
        await Promise.all([user.save(), friend.save()]);

        res.json({ msg: 'Friend request sent successfully' });
    } catch (error) {
        console.log('Error sending friend request:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user._id);
        const friend = await User.findById(friendId).populate({
            path: 'status',
            select: 'status lastSeen',
        });

        // Check if the user and friend documents exist
        if (!user || !friend) {
            return res.status(404).json({ msg: 'User or friend not found' });
        }

        // Check if the friend request exists
        if (!user.friendRequestsReceived.includes(friendId)) {
            return res.status(400).json({ msg: 'Friend request not found' });
        }

        // Remove the friendId from the user's received friend requests
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => !id.equals(friendId));

        const unreadCount = createUserCountList([user._id, friendId]);

        // Create a chat for the friends
        const chat = new Chat({
            participants: [user._id, friendId],
            type: 'single',
            unreadMessageCount: unreadCount,
        });

        // Update the user's friends list with the friend and the chat
        user.friends.push({ friend: friendId, chat: chat._id });

        // Update the friend's friends list with the user and the chat
        friend.friends.push({ friend: user._id, chat: chat._id });

        // Remove the friendId from the friend's sent friend requests
        friend.friendRequestsSent = friend.friendRequestsSent.filter(id => !id.equals(user._id));

        // Save the user, friend, and chat with the updated data
        await Promise.all([user.save(), friend.save(), chat.save()]);

        // Prepare the friend object to send in the response
        const friendObject = {
            friend: {
                _id: friend._id,
                name: friend.name,
                email: friend.email,
                avatar: friend.avatar,
                status: friend.status,
            },
            chat: {
                _id: chat._id,
                type: chat.type,
                latestMessage: chat.latestMessage,
                unreadMessageCount: chat.unreadMessageCount,
            },
        };

        res.json({ msg: 'Friend request accepted and chat created successfully', friend: friendObject });
    } catch (error) {
        console.log('Error accepting friend request:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user._id);
        const friend = await User.findById(friendId);

        // Check if the user and friend documents exist
        if (!user || !friend) {
            return res.status(404).json({ msg: 'User or friend not found' });
        }

        // Check if the friend request exists
        if (!user.friendRequestsReceived.includes(friendId)) {
            return res.status(400).json({ msg: 'Friend request not found' });
        }

        // Remove the friendId from the user's received friend requests
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => !id.equals(friendId));

        // Remove the user's ID from the friend's sent friend requests
        friend.friendRequestsSent = friend.friendRequestsSent.filter(id => !id.equals(user._id));

        // Save the updated user and friend documents
        await Promise.all([user.save(), friend.save()]);

        res.json({ msg: 'Friend request rejected successfully' });
    } catch (error) {
        console.log('Error rejecting friend request:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const deleteFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user._id);

        // Check if the user document exists
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the friend is in the user's friends list
        const friendship = user.friends.find(friendship => friendship.friend.equals(friendId));

        if (!friendship) {
            return res.status(400).json({ msg: 'User and friend are not friends' });
        }

        const friend = await User.findById(friendId);

        // Delete the associated chat if it exists
        if (friendship.chat) {
            // Assuming you have a Chat model
            await Chat.findByIdAndDelete(friendship.chat);
        }

        // Remove the friend from the user's friends list
        user.friends = user.friends.filter(f => !f.friend.equals(friendId));

        // Remove the user from the friend's friends list
        friend.friends = friend.friends.filter(f => !f.friend.equals(req.user._id));

        // Delete the chat from the friend's friends list if it exists
        if (friendship.chat) {
            friend.friends = friend.friends.filter(f => !f.chat.equals(friendship.chat));
        }

        // Save the updated user and friend documents
        await Promise.all([user.save(), friend.save()]);

        res.json({ msg: 'Friend, associated chat, and references deleted successfully' });
    } catch (error) {
        console.log('Error deleting friend and chat:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .select('name email avatar friends groups status')
            .populate({
                path: 'friends.friend',
                select: 'name email avatar status',
                populate: {
                    path: 'status',
                    select: 'status lastSeen',
                },
            })
            .populate([
                {
                    path: 'friends.chat',
                    select: 'type latestMessage unreadMessageCount',
                    populate: [
                        {
                            path: 'latestMessage',
                            select: 'sender content timestamp',
                        },
                        {
                            path: 'unreadMessageCount',
                            select: 'userId count',
                        },
                    ],
                },
                {
                    path: 'groups.chat',
                    select: 'type latestMessage unreadMessageCount',
                    populate: [
                        {
                            path: 'latestMessage',
                            select: 'sender content timestamp',
                        },
                        {
                            path: 'unreadMessageCount',
                            select: 'userId count',
                        },
                    ],
                },
            ])
            .populate({
                path: 'groups.group',
                select: 'name admin members avatar createdAt',
                populate: [
                    {
                        path: 'admin',
                        select: 'email avatar name',
                    },
                    {
                        path: 'members',
                        select: 'email avatar name status',
                        populate: {
                            path: 'status',
                            select: 'status lastSeen',
                        },
                    },
                ],
            })
            .populate({
                path: 'friendRequestsSent friendRequestsReceived',
                select: 'email avatar name',
            });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.log('Error fetching user details:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.status = { status: 'offline', lastSeen: new Date() };

        await user.save();
        res.json({ msg: 'User status updated successfully' });
    } catch (error) {
        console.log('Error updating user status:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const getUserStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .populate({
                path: 'status',
                select: 'status lastSeen'
            });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ userStatus: user.status });
    } catch (error) {
        console.log('Error updating user status:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const profileUpdate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, avatar } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update username and avatar
        user.name = username || user.name;
        user.avatar = avatar || user.avatar;

        // Save the updated user
        await user.save();

        res.json({ msg: 'Profile updated successfully', user: { _id: user._id, name: user.name, avatar: user.avatar } });
    } catch (error) {
        console.log('Error updating profile:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

module.exports = {
    allUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend,
    getUser,
    updateUserStatus,
    profileUpdate,
    getUserStatus,
};