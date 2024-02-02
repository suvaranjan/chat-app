import React, { useEffect, useState } from "react";
import { Box, useColorModeValue, Avatar, Circle } from "@chakra-ui/react";
import { convertTimeStamp } from "../../logics/timeLogic";
import { truncateMessage } from "../../logics/messageLogic";
import useStore from "../../zustand";

export default function ChatItem({ chat, handleChatClick }) {
  const { loginUser, chatList, selectedChat } = useStore((state) => state);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (chat.chat.messages == undefined) {
      updateUnreadMessageCount(chat);
    } else {
      newCounting(chat);
    }
  }, [chatList]);

  const chatName =
    chat.chat.type === "single" ? chat.friend.name : chat.group.name;

  const avatar =
    chat.chat.type === "single" ? chat.friend.avatar : chat.group.avatar;

  const latestMessage = chat.chat.latestMessage?.content;
  const time = convertTimeStamp(chat.chat.latestMessage?.timestamp);

  const updateUnreadMessageCount = (chat) => {
    const unreadMessages = chat.chat.unreadMessageCount;
    const userUnreadMessage = unreadMessages.find(
      (obj) => obj.userId === loginUser._id
    );
    if (userUnreadMessage) {
      setCount(userUnreadMessage.count);
    } else {
      setCount(0);
    }
  };

  const newCounting = (chat) => {
    const filteredMsg = chat.chat.messages.filter(
      (message) => !message.seenBy.includes(loginUser._id)
    );
    setCount(filteredMsg.length);
  };

  return (
    <Box
      p={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      onClick={() => handleChatClick(chat.chat._id)}
      cursor="pointer"
      borderRadius="md"
    >
      <Box display="flex" gap={2}>
        <Avatar name={chatName} src={avatar} />
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Box fontWeight="500">{chatName}</Box>
          {latestMessage && (
            <Box fontSize="small">{truncateMessage(latestMessage, 5)}</Box>
          )}
        </Box>
      </Box>

      {latestMessage && (
        <Box display="flex" flexDirection="column" justifyContent="center">
          {count > 0 && (
            <Circle
              size="20px"
              bg="purple.500"
              alignSelf="end"
              color="white"
              fontSize="sm"
            >
              <Box textAlign="end">{count}</Box>
            </Circle>
          )}
          <Box fontSize="small">{time}</Box>
        </Box>
      )}
    </Box>
  );
}
