export const allMessageSeenFunction = (messages, loginUserId) => {
    const updatedMessages = messages.map(message => {
        if (!message.seenBy.includes(loginUserId)) {
            message.seenBy.push(loginUserId);
        }
        return message;
    });

    return updatedMessages;
};

export const messageSeen = (msg, loginUserId) => {
    if (!msg.seenBy.includes(loginUserId)) {
        msg.seenBy.push(loginUserId);
    }
    return msg
}

export const messageSeenLogic = (selectedChat, chatList, loginUserId) => {
    const updatedMessages = allMessageSeenFunction(
        selectedChat.chat.messages,
        loginUserId
    );

    const updatedChat = {
        ...selectedChat.chat,
        messages: updatedMessages,
    };

    const updatedSelectedChat = {
        ...selectedChat,
        chat: updatedChat,
    };

    const updatedChatList = chatList.map((c) =>
        c.chat._id === selectedChat.chat._id ? updatedSelectedChat : c
    );

    return updatedChatList;
};

export const isChatMsgsFetched = (chatList, chatId) => {
    const findChat = chatList.find((c) => c.chat._id == chatId);

    return findChat.chat.messages !== undefined;
};


export const isSameSender = (groupedMessages, currentDate, m, i, loginUserId) => {
    const currentMessages = groupedMessages[currentDate];
    return (
        i < currentMessages.length - 1 &&
        (currentMessages[i + 1].sender._id !== m.sender._id ||
            currentMessages[i + 1].sender._id === undefined) &&
        currentMessages[i].sender._id !== loginUserId
    );
};

export const isLastMessage = (groupedMessages, currentDate, i, loginUserId) => {
    const currentMessages = groupedMessages[currentDate];
    return (
        i === currentMessages.length - 1 &&
        currentMessages[currentMessages.length - 1].sender._id !== loginUserId &&
        currentMessages[currentMessages.length - 1].sender._id
    );
};

export const checkUnseenMessages = (messages, loginUserId) => {
    let unseenMsgIds = [];
    for (const message of messages) {
        if (!message.seenBy.includes(loginUserId)) {
            unseenMsgIds.push(message._id);
        }
    }

    return unseenMsgIds;
}

export const truncateMessage = (message, charLimit) => {
    if (message.length > charLimit) {
        const truncatedMessage = message.slice(0, charLimit);
        return `${truncatedMessage} ...`;
    }

    return message;
};
