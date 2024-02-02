const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Group = require("../models/Group");
const { createUserCountList } = require("../helper/helper");


const getChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Query the database to find the chat with the given chatId
        const chat = await Chat.findById(chatId)
            .populate({
                path: 'messages latestMessage',
                populate: {
                    path: 'sender',
                    select: 'name avatar _id',
                },
            })


        // Check if the chat with the given chatId exists
        if (!chat) {
            return res.status(404).json({ msg: 'Chat not found' });
        }

        // Respond with the populated chat data
        res.json(chat);
    } catch (error) {
        console.log('Error fetching chat:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id;

        // Check if the chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ msg: 'Chat not found' });
        }

        // Check if the sender is a participant in the chat
        if (!chat.participants.includes(senderId)) {
            return res.status(403).json({ msg: 'You are no longer member in this group' });
        }

        // Create a new message
        const message = new Message({
            content,
            sender: senderId,
            chat: chatId,
            seenBy: [senderId],  // Add the sender's ID to the seenBy array
        });

        // Save the message
        await message.save();

        // Update the chat's messages array and latestMessage field
        chat.messages.push(message._id);
        chat.latestMessage = message._id;

        // Update unreadMessageCount for all participants except sender
        chat.participants.forEach(async (participant) => {
            if (participant.toString() !== senderId) {
                const participantIndex = chat.unreadMessageCount.findIndex(item => item.userId.toString() === participant.toString());

                if (participantIndex !== -1) {
                    // If participant is already in the array, increment the count
                    chat.unreadMessageCount[participantIndex].count += 1;
                } else {
                    // If participant is not in the array, add them with count 1
                    chat.unreadMessageCount.push({ userId: participant, count: 1 });
                }
            }
        });

        // Save the updated chat
        await chat.save();

        const populatedMessage = await Message.findById(message._id).populate({
            path: 'sender',
            select: 'id name avatar',
        });

        // Respond with the created message
        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const userId = req.user._id;

        // Include the creator in the members list if not already included
        if (!members.includes(userId)) {
            members.push(userId);
        }

        // Create a new group
        const group = new Group({
            name,
            admin: userId,
            members,
        });

        const unreadCount = createUserCountList(members);

        // Create a new chat for the group
        const chat = new Chat({
            participants: members,
            type: 'group',
            groupId: group._id,
            unreadMessageCount: unreadCount,
        });

        // Save the group and chat
        await Promise.all([group.save(), chat.save()]);

        // Use Mongoose queries to populate admin and members
        const populatedGroup = await Group.findById(group._id)
            .populate({
                path: 'admin',
                select: 'email avatar name status',
                populate: {
                    path: 'status',
                    select: 'lastSeen',
                },
            })
            .populate({
                path: 'members',
                select: 'email avatar name status',
                populate: {
                    path: 'status',
                    select: 'lastSeen',
                },
            })
            .exec();

        // Prepare the groups object to send in the response
        const NewGroup = {
            group: {
                _id: populatedGroup._id,
                name: populatedGroup.name,
                avatar: populatedGroup.avatar,
                members: populatedGroup.members,
                admin: populatedGroup.admin,
                createdAt: populatedGroup.
                    createdAt,
            },
            chat: {
                _id: chat._id,
                type: chat.type,
                latestMessage: chat.latestMessage,
                unreadMessageCount: chat.unreadMessageCount,
            },
        };

        // Update groups for all members and loginUser
        for (const memberId of members) {
            const memberUser = await User.findById(memberId);
            memberUser.groups.push({ group: group._id, chat: chat._id });
            await memberUser.save();
        }

        res.json({ msg: 'Group created successfully', NewGroup });
    } catch (error) {
        console.log('Error creating group:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const allMessageSeen = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Check if the chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ msg: 'Chat not found' });
        }

        // Check if the user is a participant in the chat
        if (!chat.participants.includes(userId)) {
            return res.status(403).json({ msg: 'Unauthorized to mark messages as seen in this chat' });
        }

        // Update seenBy for all messages in the chat
        const messages = await Message.updateMany(
            { chat: chatId, seenBy: { $ne: userId } }, // messages not seen by the user
            { $addToSet: { seenBy: userId } } // add userId to the seenBy array
        );

        // Update unreadMessageCount for the user in the chat
        const unreadMessageCountIndex = chat.unreadMessageCount.findIndex(entry => entry.userId.equals(userId));
        if (unreadMessageCountIndex !== -1) {
            chat.unreadMessageCount[unreadMessageCountIndex].count = 0;
            await chat.save();
        }

        res.json({ msg: 'All messages marked as seen' });
    } catch (error) {
        console.log('Error marking messages as seen:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};


const addMembersToGroup = async (req, res) => {
    try {
        const { groupId, members, chatId } = req.body;


        // Check if the group exists
        const group = await Group.findById(groupId);
        const chat = await Chat.findById(chatId);

        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if the admin is the req.user
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'You are not admin' });
        }

        // Add new members to the group
        for (const memberId of members) {
            // Check if the member exists
            const member = await User.findById(memberId);
            if (member) {
                // Check if the member is already a part of the group
                if (!group.members.includes(member._id) && !chat.participants.includes(member._id)) {
                    group.members.push(member._id);
                    chat.participants.push(member._id);
                    member.groups.push({ group: group._id, chat: chat._id });
                    await member.save();
                }
            }
        }

        // Save the group and chat
        await Promise.all([group.save(), chat.save()]);


        // Populate the required fields for the response
        const populatedGroup = await Group.findById(group._id)
            .populate({
                path: 'members',
                select: 'email avatar name status',
                populate: {
                    path: 'status',
                    select: 'lastSeen',
                },
            })
            .exec();

        // Send the response with populated fields
        res.json({
            message: 'Members added to the group successfully',
            updatedMembers: populatedGroup.members,
        });
    } catch (error) {
        console.log('Error adding members to group:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId, memberId, chatId } = req.body;

        // Check if the group exists
        const group = await Group.findById(groupId);
        const chat = await Chat.findById(chatId);

        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if the admin is the owner of the group
        if (group.admin.toString() !== req.user._id) {
            console.log(group.admin, req.user._id);
            return res.status(403).json({ msg: 'Unauthorized to remove member from group' });
        }

        // Check if the member is part of the group
        if (!group.members.includes(memberId)) {
            return res.status(404).json({ msg: 'Member not found in the group' });
        }

        // Remove the member from the group
        group.members = group.members.filter((member) => !member.equals(memberId));
        chat.participants = chat.participants.filter((member) => !member.equals(memberId));

        // Save the group and chat
        await Promise.all([group.save(), chat.save()]);

        // Remove the group from the member's groups
        const member = await User.findById(memberId);
        if (member) {
            member.groups = member.groups.filter(
                (userGroup) => !userGroup.group.equals(groupId)
            );
            await member.save();
        }

        res.json({ msg: 'Member removed from the group successfully' });
    } catch (error) {
        console.log('Error removing member from group:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const makeAdmin = async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const { _id: userId } = req.user;

        console.log(groupId);

        // Check if the user making the request is the current admin of the group
        const group = await Group.findById(groupId).populate('admin', '_id');
        console.log(group);
        if (!group || !group.admin || group.admin._id.toString() !== userId.toString()) {
            return res.status(403).json({ msg: 'Unauthorized to make admin' });
        }

        // Check if the member exists in the group
        const isMember = group.members.some(member => member._id.toString() === memberId);
        if (!isMember) {
            return res.status(404).json({ msg: 'Member not found in the group' });
        }

        // Update group admin and remove the previous admin from group members
        group.admin = memberId;

        // Save the updated group
        await group.save();

        res.json({ msg: 'Admin updated successfully', group });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const groupExit = async (req, res) => {
    try {
        console.log('inside ge controller');
        const { groupId } = req.body;
        const { _id: userId } = req.user;

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if the member is part of the group
        const isMember = group.members.includes(userId);
        if (!isMember) {
            return res.status(404).json({ msg: 'Member not found in the group' });
        }

        // Check if the requester is the admin of the group
        const isAdmin = group.admin.equals(userId);

        // Check conditions for removal
        if ((isAdmin && group.members.length === 1) || (!isAdmin && group.members.length > 1)) {
            // Remove the member from the group
            group.members = group.members.filter(member => !member.equals(userId));

            // Save the updated group
            await group.save();

            // Remove the group from the member's groups
            const requester = await User.findById(userId);
            if (requester) {
                requester.groups = requester.groups.filter(userGroup => !userGroup.group.equals(groupId));
                await requester.save();
            }

            res.json({ msg: 'Member removed from the group successfully' });
        } else {
            return res.status(403).json({ msg: 'Unauthorized to remove member from the group' });
        }
    } catch (error) {
        console.log('Error removing member from group:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const groupProfileUpdate = async (req, res) => {
    try {
        const { groupId, name, avatar } = req.body;

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Update group information
        group.name = name || group.name;
        group.avatar = avatar || group.avatar;

        // Save the updated group
        await group.save();
        res.json({
            message: 'Group profile updated successfully',
            group: {
                _id: group._id,
                name: group.name,
                avatar: group.avatar,
            },
        });

    } catch (error) {
        console.log('Error updating group profile:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const messagesSeenByIds = async (req, res) => {
    console.log('seen message func run')
    try {
        const userId = req.user._id;
        const { messageIds } = req.body;

        // Find all messages by their IDs
        const messages = await Message.find({ _id: { $in: messageIds } });

        // Check and update the seenBy array for each message
        for (const message of messages) {
            // Check if req.user._id is not in the seenBy array
            if (!message.seenBy.includes(userId)) {
                // Push req.user._id to the seenBy array
                message.seenBy.push(userId);
            }
        }

        // Save all updated messages
        await Promise.all(messages.map(message => message.save()));

        res.json({ msg: 'Messages marked as seen successfully' });
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const getGroupAndChatDetails = async (req, res) => {
    try {
        const { groupId, chatId } = req.body;
        // Populate Chat details
        const populatedChat = await Chat.findById(chatId)
            .select('type latestMessage unreadMessageCount')
            .populate([
                {
                    path: 'latestMessage',
                    select: 'sender content timestamp',
                },
                {
                    path: 'unreadMessageCount',
                    select: 'userId count',
                },
            ]);
        // Check if the chat exists
        if (!populatedChat) {
            return res.status(404).json({ msg: 'Chat not found' });
        }
        // Populate Group details
        const populatedGroup = await Group.findById(groupId)
            .select('name admin members avatar createdAt')
            .populate([
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
            ]);

        // Check if the group exists
        if (!populatedGroup) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Prepare the response
        const response = {
            chat: populatedChat,
            group: populatedGroup,
        };

        // Send the response
        res.json(response);
    } catch (error) {
        console.log('Error fetching group and chat details:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

module.exports = {
    getChat,
    sendMessage,
    createGroup,
    allMessageSeen,
    addMembersToGroup,
    removeMemberFromGroup,
    makeAdmin,
    groupExit,
    groupProfileUpdate,
    messagesSeenByIds,
    getGroupAndChatDetails,
};