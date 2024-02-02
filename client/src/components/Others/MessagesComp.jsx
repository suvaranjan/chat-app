import ScrollableFeed from "react-scrollable-feed";
import { Avatar, Box, Text, useColorModeValue, Button } from "@chakra-ui/react";
import { convertTimeStamp } from "../../logics/timeLogic";
import { groupMessagesByDate, formatDateLabel } from "../../logics/timeLogic";
import {
  isSameSender,
  isLastMessage,
  truncateMessage,
} from "../../logics/messageLogic";
import useStore from "../../zustand";
import HelloHi from "../lottie/HelloHi";
import { useState } from "react";

export default function MessagesComp({ messages, chatType, sayHello }) {
  const { loginUser } = useStore((state) => state);

  return (
    <ScrollableFeed>
      {messages && messages.length > 0 ? (
        chatType === "single" ? (
          <SingleChatMessages messages={messages} loginUser={loginUser} />
        ) : (
          <GroupChatMessages messages={messages} loginUser={loginUser} />
        )
      ) : (
        <Box>
          <HelloHi sayHello={sayHello} />
        </Box>
      )}
    </ScrollableFeed>
  );
}

function SingleChatMessages({ messages, loginUser }) {
  const groupedMessages = groupMessagesByDate(messages);
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {Object.keys(groupedMessages).map((date, index) => (
        <Box key={index} display="flex" flexDirection="column">
          <Text textAlign="center" fontSize="sm" color="gray.500" my={2}>
            {formatDateLabel(date)}
          </Text>
          {groupedMessages[date].map((m, i) => {
            const { bgColor, textColor } = getMessageColors(
              m.sender._id,
              loginUser._id
            );

            const contentToShow = showMore
              ? m.content
              : truncateMessage(m.content, 30);

            return (
              <Box
                alignSelf={
                  m.sender._id === loginUser._id ? "flex-end" : "flex-start"
                }
                p={1}
                pl={2}
                pr={2}
                display="flex"
                gap={2}
                bg={bgColor}
                color={textColor}
                borderRadius="md"
                key={i}
                fontSize="sm"
                mb={2}
                maxWidth="70%"
              >
                <Box>
                  <Text display="inline">{contentToShow} </Text>
                  {m.content.length > 30 && (
                    <Button
                      size="xs"
                      cursor="pointer"
                      onClick={handleShowMore}
                      ml={1}
                      colorScheme={bgColor}
                      color={textColor}
                      fontWeight="500"
                    >
                      {showMore ? "read less" : "read more"}
                    </Button>
                  )}
                </Box>
                <Text fontSize=".6rem" alignSelf="end">
                  {convertTimeStamp(m.timestamp)}
                </Text>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

function GroupChatMessages({ messages, loginUser }) {
  const groupedMessages = groupMessagesByDate(messages);
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {Object.keys(groupedMessages).map((date, index) => (
        <Box key={index} display="flex" flexDirection="column">
          <Text textAlign="center" fontSize="sm" color="gray.500" my={2}>
            {formatDateLabel(date)}
          </Text>
          {groupedMessages[date].map((m, i) => {
            const { bgColor, textColor } = getMessageColors(
              m.sender._id,
              loginUser._id
            );
            const contentToShow = showMore
              ? m.content
              : truncateMessage(m.content, 30);

            return (
              <Box
                alignSelf={
                  m.sender._id === loginUser._id ? "flex-end" : "flex-start"
                }
                display="flex"
                alignItems="center"
                key={i}
                gap={1}
                mb={
                  isSameSender(groupedMessages, date, m, i, loginUser._id) ||
                  isLastMessage(groupedMessages, date, i, loginUser._id)
                    ? 3
                    : ""
                }
                maxWidth="70%"
              >
                {(isSameSender(groupedMessages, date, m, i, loginUser._id) ||
                  isLastMessage(groupedMessages, date, i, loginUser._id)) && (
                  <Avatar
                    size="xs"
                    src={m.sender.avatar}
                    name={m.sender.name}
                    alignSelf="flex-end"
                    mb={1}
                  />
                )}
                <Box
                  p={1}
                  pl={2}
                  pr={2}
                  display="flex"
                  flexDirection="column"
                  borderRadius="md"
                  fontSize="sm"
                  ml={
                    isSameSender(groupedMessages, date, m, i, loginUser._id) ||
                    isLastMessage(groupedMessages, date, i, loginUser._id)
                      ? ""
                      : 7
                  }
                  mb={
                    isSameSender(groupedMessages, date, m, i, loginUser._id) ||
                    isLastMessage(groupedMessages, date, i, loginUser._id)
                      ? ""
                      : 1
                  }
                  bg={bgColor}
                  color={textColor}
                >
                  {(isSameSender(groupedMessages, date, m, i, loginUser._id) ||
                    isLastMessage(groupedMessages, date, i, loginUser._id)) && (
                    <Text fontSize=".7rem" fontWeight="500">
                      {m.sender.name}
                    </Text>
                  )}
                  <Box display="flex">
                    <Box>
                      <Text display="inline">{contentToShow} </Text>
                      {m.content.length > 30 && (
                        <Button
                          size="xs"
                          cursor="pointer"
                          onClick={handleShowMore}
                          ml={1}
                          colorScheme={bgColor}
                          color={textColor}
                          fontWeight="500"
                        >
                          {showMore ? "read less" : "read more"}
                        </Button>
                      )}
                    </Box>

                    <Text fontSize=".6rem" alignSelf="end" ml={2}>
                      {convertTimeStamp(m.timestamp)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

const getMessageColors = (senderId, loginUserId) => {
  const bgColorDay = senderId === loginUserId ? "blue.500" : "#E2E8F0";
  const bgColorNight = senderId === loginUserId ? "blue.400" : "#2D3748";
  const textColorDay = senderId === loginUserId ? "#FAFAFA" : "#000";
  const textColorNight = senderId === loginUserId ? "#000" : "#FAFAFA";

  return {
    bgColor: useColorModeValue(bgColorDay, bgColorNight),
    textColor: useColorModeValue(textColorDay, textColorNight),
  };
};
