import React, { useEffect, useState, useRef } from "react";
import { Box, useColorModeValue, Stack, useColorMode } from "@chakra-ui/react";
import useStore from "../../zustand";
import InputMsg from "../Others/InputMsg";
import MessagesComp from "../Others/MessagesComp";
import ChatHeader from "../Others/ChatHeader";
import { getChat, sendMessage, allMesgSeenApi } from "../api/api";
import {
  allMessageSeenFunction,
  messageSeen,
  messageSeenLogic,
  checkUnseenMessages,
} from "../../logics/messageLogic";
import LoadingMsg from "../lottie/LoadingMsg";
import socket from "../socket";
import toast from "react-hot-toast";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function Chat() {
  const { selectedChat, setSelectedChat, chatList, setChatList, loginUser } =
    useStore((state) => state);
  const [inputMsg, setInputMsg] = useState("");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState();
  const [userStatus, setUserStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (selectedChat.chat.messages) {
      setMessages(selectedChat.chat.messages);
      setLoading(false);
      const data = {
        users: selectedChat.chat.participants,
        chatId: selectedChat.chat._id,
      };
      socket.emit("getUsersStatus", data);
      allMessageSeenServer(selectedChat.chat.messages);
      allMessageSeenClint();
      return;
    }

    fetchChat();
    // allMessageSeenServer();

    if (selectedChat.chat.type == "single") {
      socket.emit("join chat", selectedChat.friend._id);
      socket.emit("join chat", selectedChat.chat._id);
    } else {
      socket.emit("join chat", selectedChat.chat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", handleReceivedMessage);
    socket.on("recieved onlineUsers", handleOnlineUsers);
    socket.on("typing on", handleTypingOn);
    socket.on("typing off", handleTypingOff);

    return () => {
      socket.off("message received", handleReceivedMessage);
      socket.off("recieved onlineUsers", handleOnlineUsers);
      socket.off("typing on", handleTypingOn);
      socket.off("typing off", handleTypingOff);
    };
  });

  useEffect(() => {
    const handleTyping = () => {
      const typingData = {
        name: loginUser.name,
        _id: loginUser._id,
        chatId: selectedChat.chat._id,
      };

      if (!isTyping) {
        setIsTyping(true);
      }
      socket.emit("typing-start", typingData);
      clearTimeout(typingTimeoutRef.current); // Clear any existing timeout

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", typingData);
        setIsTyping(false);
      }, 1000);
    };

    if (inputMsg) {
      handleTyping();
    }

    return () => {
      clearTimeout(typingTimeoutRef.current); // Clear timeout on unmount
    };
  }, [inputMsg]); // Run the effect whenever inputMsg changes

  const allMessageSeenClint = () => {
    const updatedChatList = messageSeenLogic(
      selectedChat,
      chatList,
      loginUser._id
    );
    setChatList(updatedChatList);
  };

  const handleReceivedMessage = (message) => {
    if (
      message.chat == selectedChat.chat._id &&
      message.sender._id !== loginUser._id
    ) {
      // console.log(message);
      const updatedSeenMsg = messageSeen(message, loginUser._id);
      setMessages([...messages, updatedSeenMsg]);

      const updatedChat = {
        ...selectedChat.chat,
        messages: [...messages, updatedSeenMsg],
        latestMessage: message,
      };

      const updatedSelectedChat = {
        ...selectedChat,
        chat: updatedChat,
      };

      const updatedChatList = chatList.map((c) =>
        c.chat._id === selectedChat.chat._id ? updatedSelectedChat : c
      );
      setChatList(updatedChatList);
    }
  };

  const handleOnlineUsers = (onlineUsers) => {
    if (
      selectedChat.chat.type == "single" &&
      onlineUsers.includes(selectedChat.friend._id)
    ) {
      setUserStatus("online");
    } else {
      setUserStatus(null);
    }
  };

  const handleTypingOn = (data) => {
    const existingUser = typingUsers.find(
      (user) => user._id === data._id && user.chatId === data.chatId
    );

    if (!existingUser && data._id !== loginUser._id) {
      setTypingUsers([...typingUsers, data]);
    }
  };

  const handleTypingOff = (data) => {
    setTypingUsers((prevTypingUsers) =>
      prevTypingUsers.filter(
        (user) =>
          !user._id ||
          !user.chatId ||
          !(user._id === data._id && user.chatId === data.chatId)
      )
    );
  };

  const allMessageSeenServer = async (messages) => {
    console.log("unseen api call");
    const UnseenMsgIds = checkUnseenMessages(messages, loginUser._id);

    if (UnseenMsgIds.length > 0) {
      try {
        const res = await allMesgSeenApi(token, selectedChat.chat._id);
        console.log(res);
      } catch (error) {
        toast.error(error.response.data.msg);
        console.log(error);
      }
    }
  };

  const fetchChat = async () => {
    try {
      setLoading(true);
      const res = await getChat(token, selectedChat.chat._id);
      const updatedSelectedChat = {
        ...selectedChat,
        chat: res.data,
      };
      allMessageSeenServer(res.data.messages);
      const updatedMessages = allMessageSeenFunction(
        res.data.messages,
        loginUser._id
      );
      setMessages(updatedMessages);
      setSelectedChat(updatedSelectedChat);

      const usersData = {
        users: res.data.participants,
        chatId: selectedChat.chat._id,
      };
      socket.emit("getUsersStatus", usersData);

      const updatedChatList = chatList.map((c) => {
        if (c.chat._id === selectedChat.chat._id) {
          return updatedSelectedChat;
        }
        return c;
      });

      setChatList(updatedChatList);
    } catch (error) {
      toast.error(error.response.data.msg);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputMsg === "") return;

    const typingData = {
      name: loginUser.name,
      _id: loginUser._id,
      chatId: selectedChat.chat._id,
    };
    socket.emit("typing-stop", typingData);

    try {
      setInputMsg("");
      const res = await sendMessage(token, selectedChat.chat._id, inputMsg);
      setMessages([...messages, res.data]);
      const data = {
        chatType: selectedChat.chat.type,
        message: res.data,
        participants: selectedChat.chat.participants,
        loginUserId: loginUser._id,
      };
      // console.log(selectedChat);
      socket.emit("new message", data);

      const updatedChat = {
        ...selectedChat.chat,
        messages: [...selectedChat.chat.messages, res.data],
        latestMessage: res.data,
      };

      const updatedSelectedChat = {
        ...selectedChat,
        chat: updatedChat,
      };

      const updatedChatList = chatList.map((c) =>
        c.chat._id === selectedChat.chat._id ? updatedSelectedChat : c
      );

      setChatList(updatedChatList);
    } catch (error) {
      toast.error(error.response.data.msg);
      console.log(error);
    }
  };

  const handleInputTyping = (value) => {
    setInputMsg(value);
  };
  const handleLeaveChat = () => {
    setSelectedChat(null);
  };
  const sayHello = () => {
    if (inputMsg !== "Hello 👋") {
      setInputMsg("Hello 👋");
    }
  };

  const handleEmojiSelect = (emoji) => {
    const updatedInputMsg = `${inputMsg}${emoji.native}`;
    setInputMsg(updatedInputMsg);
  };

  const chatHeaderBg = useColorModeValue("#CBD5E0", "#2D3748");
  const chatHeaderColor = useColorModeValue("#1A202C", "#E2E8F0");

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        // borderWidth={1}
        alignItems="center"
        p={2}
        bg={chatHeaderBg}
        color={chatHeaderColor}
      >
        <ChatHeader
          handleLeaveChat={handleLeaveChat}
          userStatus={userStatus}
          typingUsers={typingUsers}
        />
      </Box>

      <Box
        p={2}
        flex="1"
        display="flex"
        flexDir="column"
        overflowY="hidden"
        // bg={MsgBoxBg}
      >
        {!loading && (
          <MessagesComp
            messages={messages}
            chatType={selectedChat.chat.type}
            sayHello={sayHello}
          />
        )}
        {loading && !selectedChat.chat.messages && <LoadingMsg />}
      </Box>

      <Box p={1} display="flex" gap={2} alignItems="center">
        <Stack w="100%">
          {openPicker && (
            <Box zIndex={100} position="fixed" bottom="81" right="30">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme={colorMode}
              />
            </Box>
          )}

          <InputMsg
            handleInputTyping={handleInputTyping}
            inputMsg={inputMsg}
            handleSend={handleSend}
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
          />
        </Stack>
      </Box>
    </Box>
  );
}
