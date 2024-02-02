import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import { Box, Flex } from "@chakra-ui/react";
import Chat from "./Chat";
import useStore from "../../zustand";
import { useNavigate } from "react-router-dom";
import { getUser } from "../api/api";
import socket from "../socket";
import useSocketManager from "../socketManager";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    setChatList,
    selectedChat,
    setSelectedChat,
    setFriends,
    setFriendRequestsSent,
    setFriendRequestsReceived,
    setLoginUser,
    loginUser,
    chatList,
  } = useStore((state) => state);
  let token = localStorage.getItem("token");

  const { setupSocketListeners, cleanupSocketListeners } = useSocketManager();

  useEffect(() => {
    console.log(token);
    if (!token) {
      navigate("/login");
    }

    if (loginUser == null) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, [
    token,
    loginUser,
    navigate,
    setupSocketListeners,
    cleanupSocketListeners,
  ]);

  useEffect(() => {
    if (loginUser) {
      socket.emit("setup", loginUser._id);
    }
  }, [loginUser]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUser(token);

      const friendsArray = userData.data.friends.map(({ friend }) => ({
        ...friend,
      }));

      const userInfo = {
        _id: userData.data._id,
        name: userData.data.name,
        email: userData.data.email,
        avatar: userData.data.avatar,
        statusId: userData.data.status,
      };

      setLoginUser(userInfo);
      setChatList([...userData.data.friends, ...userData.data.groups]);
      setFriends([...friendsArray]);
      setFriendRequestsSent([...userData.data.friendRequestsSent]);
      setFriendRequestsReceived([...userData.data.friendRequestsReceived]);
    } catch (error) {
      console.log(error);
      if (
        error.response.data.msg === "Access token missing" ||
        "Invalid access token"
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        setLoginUser(null);
        setSelectedChat(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    setSelectedChat(null);
    const newSelectedChat = chatList.find((c) => c.chat._id === chatId);
    setSelectedChat(newSelectedChat);
  };

  return (
    <Flex h="90vh" direction={{ base: "column", md: "row" }} pl={2} pr={2}>
      <Box
        flex={{ md: "3" }}
        display={{ base: selectedChat ? "none" : "block", md: "block" }}
        overflow="auto"
        height="100%"
      >
        <ChatList loading={loading} handleChatClick={handleChatClick} />
      </Box>

      <Box
        flex={{ base: "2", md: "7" }}
        display="block"
        overflow="hidden"
        borderWidth={1}
      >
        {selectedChat && <Chat />}
      </Box>
    </Flex>
  );
}
