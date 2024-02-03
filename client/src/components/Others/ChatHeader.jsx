import React, { useEffect, useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import {
  Box,
  Text,
  Avatar,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
} from "@chakra-ui/react";
import useStore from "../../zustand";
import { formatStatus } from "../../logics/timeLogic";
import GroupInfo from "../Others/GroupInfo";
import MakeAdmin from "../Others/MakeAdmin";
import Alert from "../Others/Alert";
import { groupExit } from "../api/api";
import toast from "react-hot-toast";

export default function ChatHeader({
  handleLeaveChat,
  userStatus,
  typingUsers,
}) {
  const [typingUserNames, setTypingUserNames] = useState([]);
  const { selectedChat, setSelectedChat, loginUser, setChatList, chatList } =
    useStore((state) => state);
  const token = localStorage.getItem("token");

  useEffect(() => {
    handleTypingData();
    // console.log(typingUsers);
  }, [typingUsers]);

  const handleExit = () => {
    if (
      loginUser._id == selectedChat.group.admin._id &&
      selectedChat.group.members.length > 1
    ) {
      onMakeAdminOpen();
    } else {
      onAlertOpen();
    }
  };

  const exitGroup = () => {
    toast.promise(groupExit(token, { groupId: selectedChat.group._id }), {
      loading: `Exiting from group..`,
      success: (r) => {
        // const updatedChatList = chatList.filter((c) => c !== selectedChat);
        const updatedChatList = chatList.filter((c) => {
          if (c.chat.type == "group" && c.group._id == selectedChat.group._id) {
            return false;
          }
          return true;
        });
        setSelectedChat(null);
        setChatList(updatedChatList);
        return `Group exit successfull`;
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  const handleTypingData = () => {
    if (typingUsers.length > 0) {
      const names = typingUsers.map((u) => {
        if (u.chatId == selectedChat.chat._id) {
          return u.name;
        }
      });
      setTypingUserNames(names);
    } else {
      setTypingUserNames([]);
    }
  };

  const {
    isOpen: groupInfoIsOpen,
    onOpen: onGroupInfoOpen,
    onClose: onGroupInfoClose,
  } = useDisclosure();
  const {
    isOpen: makeAdminIsOpen,
    onOpen: onMakeAdminOpen,
    onClose: onMakeAdminClose,
  } = useDisclosure();

  const {
    isOpen: alertIsOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();

  return (
    <>
      {selectedChat.chat.type === "single" ? (
        <SingleChatHeader
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
          handleLeaveChat={handleLeaveChat}
          userStatus={userStatus}
          typingUserNames={typingUserNames}
        />
      ) : (
        <GroupChatHeader
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
          handleExit={handleExit}
          groupInfoIsOpen={groupInfoIsOpen}
          onGroupInfoOpen={onGroupInfoOpen}
          onGroupInfoClose={onGroupInfoClose}
          makeAdminIsOpen={makeAdminIsOpen}
          onMakeAdminOpen={onMakeAdminOpen}
          onMakeAdminClose={onMakeAdminClose}
          alertIsOpen={alertIsOpen}
          onAlertOpen={onAlertOpen}
          onAlertClose={onAlertClose}
          exitGroup={exitGroup}
          handleLeaveChat={handleLeaveChat}
          typingUserNames={typingUserNames}
        />
      )}
    </>
  );
}

function SingleChatHeader({
  selectedChat,
  handleLeaveChat,
  userStatus,
  typingUserNames,
}) {
  const { colorMode } = useColorMode();
  const status = userStatus
    ? userStatus
    : formatStatus(selectedChat.friend.status.lastSeen);
  const typingNames =
    typingUserNames.length !== 0 ? typingUserNames.join(", ") : null;
  return (
    <>
      <Box onClick={() => handleLeaveChat()}>
        <ArrowBackIcon boxSize={5} />
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <Avatar
          name={selectedChat.friend.name}
          src={selectedChat.friend.avatar}
        />
        <Box display="flex" flexDirection="column">
          <Text fontWeight="500">{selectedChat.friend.name}</Text>
          {typingNames && typingNames === selectedChat.friend.name ? (
            <Text
              fontSize="small"
              color={colorMode === "dark" ? "blue.300" : "blue.500"}
              fontWeight="500"
            >
              Typing..
            </Text>
          ) : (
            <Text fontSize="small">{status}</Text>
          )}
        </Box>
      </Box>
      <Box>
        <DotsVerticalIcon width={18} height={18} />
      </Box>
    </>
  );
}

function GroupChatHeader({
  selectedChat,
  handleExit,
  groupInfoIsOpen,
  onGroupInfoOpen,
  onGroupInfoClose,
  makeAdminIsOpen,
  onMakeAdminOpen,
  onMakeAdminClose,
  alertIsOpen,
  onAlertOpen,
  onAlertClose,
  exitGroup,
  handleLeaveChat,
  typingUserNames,
}) {
  const { colorMode } = useColorMode();
  const typingNames =
    typingUserNames.length !== 0 ? typingUserNames.join(", ") : null;
  return (
    <>
      <Box onClick={() => handleLeaveChat()}>
        <ArrowBackIcon boxSize={5} />
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <Avatar
          name={selectedChat.group.name}
          src={selectedChat.group.avatar}
        />
        <Box display="flex" flexDirection="column">
          <Text fontWeight="500">{selectedChat.group.name}</Text>
          {typingNames ? (
            <Text
              fontSize="small"
              color={colorMode === "dark" ? "blue.300" : "blue.500"}
            >{`${typingNames} Typing..`}</Text>
          ) : (
            <Text fontSize="small" cursor="pointer" onClick={onGroupInfoOpen}>
              Click here for group info
            </Text>
          )}
        </Box>
      </Box>
      <Box>
        <Menu>
          <MenuButton
            as={DotsVerticalIcon}
            cursor="pointer"
            height={18}
            width={18}
          />
          <MenuList>
            <MenuItem onClick={handleExit}>Exit group</MenuItem>
          </MenuList>
        </Menu>
      </Box>
      <GroupInfo
        isOpen={groupInfoIsOpen}
        onOpen={onGroupInfoOpen}
        onClose={onGroupInfoClose}
        group={selectedChat.group}
        chatId={selectedChat.chat._id}
      />
      <MakeAdmin
        isOpen={makeAdminIsOpen}
        onOpen={onMakeAdminOpen}
        onClose={onMakeAdminClose}
        members={selectedChat.group.members.filter(
          (m) => m._id !== selectedChat.group.admin._id
        )}
        onConfirm={onAlertOpen}
        groupId={selectedChat.group._id}
      />
      <Alert
        isOpen={alertIsOpen}
        onOpen={onAlertOpen}
        onClose={onAlertClose}
        message="you want to leave group ?"
        onConfirm={exitGroup}
      />
    </>
  );
}
