// socketManager.js
import socket from './socket';
import useStore from '../zustand';
import { isChatMsgsFetched } from "../logics/messageLogic";
import { getGroupWithChat } from './api/api'

const token = localStorage.getItem("token");

const useSocketManager = () => {
    const {
        setChatList,
        setFriends,
        setFriendRequestsSent,
        setFriendRequestsReceived,
        // setSelectedChat,
        // setLoginUser,
        loginUser,
        chatList,
        friends,
        friendRequestsReceived,
        friendRequestsSent,
        selectedChat,
    } = useStore((state) => state);

    const handleReceivedMessage = (msg) => {
        console.log(msg);
        const isChatMsgsAvailable = isChatMsgsFetched(chatList, msg.chat);
        const updatedChatList = chatList.map((chatItem) => {
            if (chatItem.chat._id === msg.chat && msg.sender._id !== loginUser._id) {
                let updatedChat;

                if (
                    (!selectedChat && isChatMsgsAvailable) ||
                    (selectedChat &&
                        selectedChat.chat._id !== msg.chat &&
                        isChatMsgsAvailable)
                ) {
                    const updatedMessages = [...chatItem.chat.messages, msg];

                    updatedChat = {
                        ...chatItem.chat,
                        messages: updatedMessages,
                        latestMessage: msg,
                    };
                } else {
                    console.log(msg);
                    const updatedCount = chatItem.chat.unreadMessageCount.map((u) => {
                        if (u.userId === loginUser._id) {
                            u.count = u.count + 1;
                        }
                        return u;
                    });
                    updatedChat = {
                        ...chatItem.chat,
                        latestMessage: msg,
                        unreadMessageCount: updatedCount,
                    };
                }
                return { ...chatItem, chat: updatedChat };
            }
            return chatItem;
        });
        setChatList(updatedChatList);
    };

    const handleFrndReqRecieved = (user) => {
        const isUser1AlreadyPresent =
            friends.some((friend) => friend._id === user._id) ||
            friendRequestsReceived.some((request) => request._id === user._id);
        if (!isUser1AlreadyPresent) {
            setFriendRequestsReceived([...friendRequestsReceived, user]);
        }
    };

    const handleFrndReqRejected = (user) => {
        console.log('rejected', user._id);
        if (
            !friends.some((friend) => friend._id === user._id) &&
            friendRequestsSent.some((request) => request._id === user._id)
        ) {
            const filteredRequests = friendRequestsSent.filter(
                (request) => request._id !== user._id
            );
            setFriendRequestsSent(filteredRequests);
        }
    };

    const handleFrndReqAccepted = (data) => {
        const { newChat, toUserId } = data;
        if (toUserId !== loginUser._id) return;
        const isChatUnique = !chatList.some(
            (chatItem) => chatItem.chat._id === newChat.chat._id
        );
        const isFriendUnique = !friends.some((f) => f._id === newChat.friend._id);
        const newSentReq = friendRequestsSent.filter((f) => f._id !== newChat.friend._id);
        const newSentRec = friendRequestsReceived.filter((f) => f._id !== newChat.friend._id);

        if (isChatUnique) {
            setChatList([...chatList, newChat]);
        }
        if (isFriendUnique) {
            setFriends([...friends, newChat.friend]);
            setFriendRequestsSent(newSentReq)
            setFriendRequestsReceived(newSentRec)
        }
    };

    const handleFrndDelete = (deleteUserId) => {
        const updatedChatList = chatList.filter((c) => {
            if (c.chat.type == 'single' && c.friend._id == deleteUserId) {
                return false;
            }
            return true;
        });
        const newFriends = friends.filter((f) => f._id !== deleteUserId);
        setChatList(updatedChatList);
        setFriends(newFriends);
    };

    const handleNewGroupPush = (group) => {
        const isGroupUnique = !chatList.some(
            (chatItem) => chatItem.chat._id === group.chat._id
        );

        if (isGroupUnique) {
            setChatList([...chatList, group]);
        }
    };

    const handleMemberRemoved = (data) => {
        const { groupId, removedUserId } = data;
        const isGroupExists = chatList.find((c) => {
            if (c.chat.type === 'group' && c.group._id == groupId) {
                return true;
            }
            return false
        });
        console.log(isGroupExists);

        if (isGroupExists && isGroupExists.group.members.some((m) => m._id == removedUserId) && loginUser._id == removedUserId) {
            const updatedChatList = chatList.filter((c) => {
                if (c.chat.type === 'group' && c.group._id == groupId) {
                    return false
                }
                return true;
            });
            setChatList(updatedChatList);
        }

        if (isGroupExists && isGroupExists.group.members.some((m) => m._id == removedUserId) && loginUser._id !== removedUserId) {
            const updatedChatList = chatList.map((c) => {
                if (c.chat.type === "group" && c.group._id === groupId) {
                    c.group.members = c.group.members.filter((m) => m._id !== removedUserId);
                    if (c.chat.participants) {
                        c.chat.participants = c.chat.participants.filter((p) => p._id !== removedUserId);
                    }
                }
                return c;
            });
            setChatList(updatedChatList);
        }
    };

    const handleMembersAdded = async (data) => {
        const { updatedMembers, newParticipants, groupId, chatId } = data;
        const membersIds = updatedMembers.map((m) => m._id);

        const isGroupExists = chatList.find((c) => {
            if (c.chat.type === 'group' && c.group._id == groupId) {
                return true;
            }
            return false;
        });

        if (isGroupExists) {
            const updatedChatList = chatList.map((c) => {
                if (c.chat.type === "group" && c.group._id === groupId) {
                    c.group.members = updatedMembers;
                    if (c.chat.participants) {
                        c.chat.participants = [...c.chat.participants, ...newParticipants]
                    }
                }
                return c;
            });
            setChatList(updatedChatList);
        }


        if (!isGroupExists && membersIds.includes(loginUser._id)) {

            try {
                const data = { chatId, groupId }
                const res = await getGroupWithChat(token, data);
                setChatList([...chatList, res.data])
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleAdminChange = (data) => {
        console.log(data);
        const updatedChatList = chatList.map((c) => {
            if (c.chat.type === "group" && c.group._id === data.groupId) {
                c.group.admin = data.newAdmin;
            }
            return c;
        });

        setChatList(updatedChatList);
    }


    const setupSocketListeners = () => {
        socket.on('message received', handleReceivedMessage);
        socket.on('friend reqRecieved', handleFrndReqRecieved);
        socket.on('friend reqRejected', handleFrndReqRejected);
        socket.on('friend reqAccepted', handleFrndReqAccepted);
        socket.on('friend deleted', handleFrndDelete);
        socket.on('group created', handleNewGroupPush);
        socket.on('member-is-removed', handleMemberRemoved);
        socket.on('members-are-added', handleMembersAdded);
        socket.on('admin-is-changed', handleAdminChange);
    };

    const cleanupSocketListeners = () => {
        socket.off('message received', handleReceivedMessage);
        socket.off('friend reqRecieved', handleFrndReqRecieved);
        socket.off('friend reqRejected', handleFrndReqRejected);
        socket.off('friend reqAccepted', handleFrndReqAccepted);
        socket.off('friend deleted', handleFrndDelete);
        socket.off('group created', handleNewGroupPush);
        socket.off('members-are-added', handleMembersAdded);
        socket.off('admin-is-changed', handleAdminChange);
    };

    return {
        setupSocketListeners,
        cleanupSocketListeners,
    };
};

export default useSocketManager;
