import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
} from "@chakra-ui/react";
import YourFrnds from "../Others/YourFrnds";
import MakeFrnd from "../Others/MakeFrnd";
import InputSerch from "../Others/InputSerch";
import FrndReqs from "../Others/FrndReqs";
import useStore from "../../zustand";
import {
  searchUserApi,
  sendFrndReq,
  acceptFrndReq,
  rejectFrndReq,
  deleteFrnd,
  getUser,
} from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import useSocketManager from "../socketManager";
import SearchAnimation from "../lottie/SearchAnimation";

export default function Friends() {
  const token = localStorage.getItem("token");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [InputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [acceptingUserId, setAcceptingUserId] = useState(null);
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const navigate = useNavigate();

  const {
    chatList,
    setChatList,
    setFriends,
    setFriendRequestsSent,
    friendRequestsSent,
    friends,
    setFriendRequestsReceived,
    friendRequestsReceived,
    setLoginUser,
    loginUser,
    setSelectedChat,
  } = useStore((state) => state);

  const { setupSocketListeners, cleanupSocketListeners } = useSocketManager();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }

    if (loginUser == null) {
      fetchUser();
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

  const fetchUser = async () => {
    console.log("running fetchUser in /friends");
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

  const handleSearch = async () => {
    if (InputText == "") return;
    try {
      setSearching(true);
      const response = await searchUserApi(token, InputText);
      setSearchResults(response.data);
    } catch (error) {
      toast.error(error.response.data.msg);
      console.log("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteFriend = async (f) => {
    try {
      toast.promise(deleteFrnd(token, f._id), {
        loading: `Removing ${f.name}`,
        success: (d) => {
          const updatedFriends = friends.filter(
            (prevFrnd) => prevFrnd._id !== f._id
          );

          const updatedChatList = chatList.filter((c) => {
            if (c.chat.type == "single" && c.friend._id == f._id) {
              return false;
            }
            return true;
          });

          setFriends(updatedFriends);
          setChatList(updatedChatList);

          const data = {
            deleteUserId: loginUser._id,
            toUserId: f._id,
          };
          socket.emit("friend delete", data);
          return "friend removed";
        },
        error: (e) => {
          console.log(e);
          return "An error occured";
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessage = (f) => {
    const selectChat = chatList.find((c) => {
      if (c.chat.type === "single" && c.friend._id == f._id) {
        return c;
      }
    });

    setSelectedChat(selectChat);
    navigate("/dashboard");
  };

  const handleAddFriend = async (f) => {
    try {
      setAddingUserId(f._id);
      setIsAdding(true);
      const res = await sendFrndReq(token, f._id);
      console.log(res);

      const updatedReqSent = [...friendRequestsSent, f];

      setFriendRequestsSent([...updatedReqSent]);
      toast.success("Request Sent");

      const data = {
        requester: {
          avatar: loginUser.avatar,
          email: loginUser.email,
          name: loginUser.name,
          _id: loginUser._id,
        },
        toUserId: f._id,
      };
      socket.emit("friend reqSent", data);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.msg);
    } finally {
      setIsAdding(false);
      setAddingUserId(null);
    }
  };

  const handleReqAccept = async (f) => {
    try {
      setAcceptingUserId(f._id);
      setIsAccepting(true);
      const res = await acceptFrndReq(token, f._id);
      console.log(res.data);

      const updatedReqRec = friendRequestsReceived.filter(
        (prevFrnd) => prevFrnd._id !== f._id
      );

      const updatedFriends = [...friends, res.data.friend.friend];

      const updatedChatList = [...chatList, res.data.friend];
      setFriendRequestsReceived(updatedReqRec);
      setFriends(updatedFriends);
      setChatList(updatedChatList);
      toast.success("Request Accepted");

      // sending live via socket.io
      const newFriend = {
        _id: loginUser._id,
        name: loginUser.name,
        avatar: loginUser.avatar,
        email: loginUser.email,
        status: {
          _id: loginUser.statusId,
          status: "offline",
          lastSeen: new Date(),
        },
      };

      const newChat = {
        friend: newFriend,
        chat: res.data.friend.chat,
      };

      const data = {
        newChat,
        toUserId: f._id,
      };

      socket.emit("friend reqAccept", data);
    } catch (error) {
      console.log(error);
      toast.error(err.response.data.msg);
    } finally {
      setIsAccepting(false);
      setAcceptingUserId(null);
    }
  };

  const handleReqReject = async (f) => {
    try {
      setRejectingUserId(f._id);
      setIsRejecting(true);
      const res = await rejectFrndReq(token, f._id);
      const updatedFriendRequestsReceived = friendRequestsReceived.filter(
        (PrevF) => PrevF._id !== f._id
      );
      setFriendRequestsReceived(updatedFriendRequestsReceived);
      toast.success("Request Rejected");
      const data = {
        rejecter: {
          avatar: loginUser.avatar,
          email: loginUser.email,
          name: loginUser.name,
          _id: loginUser._id,
        },
        toUserId: f._id,
      };
      socket.emit("friend reqReject", data);
    } catch (error) {
      console.log(error);
      toast.error(err.response.data.msg);
    } finally {
      setIsRejecting(false);
      setRejectingUserId(null);
    }
  };

  return (
    <>
      <Container minH="90vh" borderWidth="2px">
        <Tabs>
          <TabList>
            <Tab>Your Friends</Tab>
            <Tab>Make Friends</Tab>
            <Tab>Friends Requests</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {friends.length !== 0 &&
                friends.map((f) => {
                  return (
                    <YourFrnds
                      friend={f}
                      key={f._id}
                      handleDeleteFriend={handleDeleteFriend}
                      handleMessage={handleMessage}
                    />
                  );
                })}
              {friends.length === 0 && (
                <Box height="100%" fontSize="small" color="#718096">
                  No friends found!!
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              <Box display="flex" flexDirection="column" gap={2}>
                <InputSerch
                  InputText={InputText}
                  setInputText={setInputText}
                  handleSearch={handleSearch}
                />
                {searching ? (
                  <SearchAnimation />
                ) : (
                  searchResults.length > 0 &&
                  searchResults.map((u) => {
                    return (
                      <MakeFrnd
                        user={u}
                        key={u._id}
                        handleAddFriend={handleAddFriend}
                        handleMessage={handleMessage}
                        isAdding={isAdding}
                        addingUserId={addingUserId}
                      />
                    );
                  })
                )}
                {!searching && searchResults.length == 0 && (
                  <Box height="100%" fontSize="small" color="#718096">
                    No records found!!
                  </Box>
                )}
              </Box>
            </TabPanel>
            <TabPanel>
              {friendRequestsReceived.length !== 0 &&
                friendRequestsReceived.map((f) => {
                  return (
                    <FrndReqs
                      key={f._id}
                      user={f}
                      handleReqAccept={handleReqAccept}
                      handleReqReject={handleReqReject}
                      isAccepting={isAccepting}
                      isRejecting={isRejecting}
                      rejectingUserId={rejectingUserId}
                      acceptingUserId={acceptingUserId}
                    />
                  );
                })}

              {friendRequestsReceived.length === 0 && (
                <Box height="100%" fontSize="small" color="#718096">
                  No requests found!!
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>{" "}
    </>
  );
}
