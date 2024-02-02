import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Avatar,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Code,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { formatStatus } from "../../logics/timeLogic";

import { DotsVerticalIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import useStore from "../../zustand";
import { addMembers, removeMember, makeAdminApi } from "../api/api";
import toast from "react-hot-toast";
import ProfileUpdate from "./ProfileUpdate";
import socket from "../socket";

function GroupInfo({ isOpen, onOpen, onClose, group, chatId }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [addedMembers, setAddedMembers] = useState([]);
  const { friends, chatList, setChatList, loginUser } = useStore(
    (state) => state
  );
  const token = localStorage.getItem("token");
  const {
    isOpen: isProfileUpdateOpen,
    onOpen: onProfileUpdateOpen,
    onClose: onProfileUpdateClose,
  } = useDisclosure();

  const handleAddMember = (friend) => {
    setAddedMembers((prevAddedMembers) => [...prevAddedMembers, friend]);
    setSearchKeyword("");
  };

  const handleRemoveMember = (friend) => {
    setAddedMembers((prevAddedMembers) =>
      prevAddedMembers.filter((addedMember) => addedMember._id !== friend._id)
    );
  };

  const handleSave = (addedMembers, groupId) => {
    const members = addedMembers.map((person) => person._id);
    const data = {
      groupId,
      members,
      chatId,
    };

    toast.promise(addMembers(token, data), {
      loading: `Adding members`,
      success: (r) => {
        const updatedMembers = r.data.updatedMembers;

        const updatedChatList = chatList.map((c) => {
          if (c.chat.type == "group" && c.group._id == groupId) {
            c.group.members = updatedMembers;
            c.chat.participants = [...c.chat.participants, ...members];
          }
          return c;
        });

        setChatList(updatedChatList);
        setAddedMembers([]);

        const newData = {
          updatedMembers,
          newParticipants: members,
          groupId,
          chatId,
          loginUserId: loginUser._id,
        };
        socket.emit("members added", newData);
        return "All members added";
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  const makeAdmin = (f) => {
    const data = {
      groupId: group._id,
      memberId: f._id,
    };

    const newAdmin = {
      name: f.name,
      _id: f._id,
      email: f.email,
      avatar: f.avatar,
    };

    toast.promise(makeAdminApi(token, data), {
      loading: `Changing Admin to ${f.name}`,
      success: (r) => {
        const updatedChatList = chatList.map((c) => {
          if (c.chat.type === "group" && c.group._id === group._id) {
            c.group.admin = newAdmin;
          }
          return c;
        });

        setChatList(updatedChatList);
        const membersIds = group.members.map((m) => m._id);
        const newData = {
          membersIds,
          groupId: group._id,
          newAdmin,
          loginUserId: loginUser._id,
        };
        socket.emit("admin changed", newData);
        return `${f.name} is now admin`;
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  const removeUser = (f) => {
    const data = {
      groupId: group._id,
      memberId: f._id,
      chatId: chatId,
    };

    toast.promise(removeMember(token, data), {
      loading: `Removing ${f.name}`,
      success: (r) => {
        const updatedChatList = chatList.map((c) => {
          if (c.chat.type === "group" && c.group._id === group._id) {
            c.group.members = c.group.members.filter((m) => m._id !== f._id);
            c.chat.participants = c.chat.participants.filter(
              (p) => p._id !== f._id
            );
          }
          return c;
        });
        setChatList(updatedChatList);
        const removeData = {
          groupId: group._id,
          memberIds: group.members.map((member) => member._id),
          removedUserId: f._id,
          loginUserId: loginUser._id,
        };
        socket.emit("member removed", removeData);
        return `${f.name} removed from group`;
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "xs", md: "md" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Box display="flex" alignItems="center" gap={2}>
              <Text fontWeight="500">Group Info</Text>
              <Pencil2Icon
                cursor="pointer"
                onClick={() => {
                  onProfileUpdateOpen();
                }}
              />
            </Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={1}>
              <GroupBox1 group={group} />
            </Box>
            <Box>
              <GroupBox2
                members={group.members}
                searchKeyword={searchKeyword}
                onAddMember={handleAddMember}
                addedMembers={addedMembers}
                onRemoveMember={handleRemoveMember}
                friends={friends}
                setSearchKeyword={setSearchKeyword}
                makeAdmin={makeAdmin}
                removeUser={removeUser}
                adminId={group.admin._id}
                loginUser={loginUser}
              />
            </Box>
          </ModalBody>
          {addedMembers.length > 0 && (
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} size="sm">
                Close
              </Button>

              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => handleSave(addedMembers, group._id)}
              >
                Save
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
        <ProfileUpdate
          isOpen={isProfileUpdateOpen}
          onOpen={onProfileUpdateOpen}
          onClose={onProfileUpdateClose}
          header="Group Update"
          data={{
            info: {
              name: group.name,
              avatar: group.avatar,
              _id: group._id,
            },
            type: "group-profile-update",
          }}
        />
      </Modal>
    </>
  );
}

function GroupBox1({ group }) {
  return (
    <Box display="flex" gap={4} alignItems="center">
      <Box>
        <Avatar src={group.avatar} name={group.name} />
      </Box>
      <Box display="flex" flexDir="column" fontSize="small">
        <Text>{`Name : ${group.name}`}</Text>
        <Text>{`Admin : ${group.admin.name}`}</Text>
        <Text>{`Created at : ${formatStatus(group.createdAt)}`}</Text>
      </Box>
    </Box>
  );
}

function GroupBox2({
  members,
  searchKeyword,
  onAddMember,
  addedMembers,
  onRemoveMember,
  friends,
  setSearchKeyword,
  makeAdmin,
  removeUser,
  adminId,
  loginUser,
}) {
  return (
    <Tabs>
      <TabList>
        <Tab fontSize="small">Members</Tab>
        {loginUser._id == adminId && <Tab fontSize="small">Add Members</Tab>}
      </TabList>

      <TabPanels maxH="150px" overflow="auto">
        <TabPanel>
          {members.map((m) => (
            <Member
              key={m._id}
              avatar={m.avatar}
              name={m.name}
              removeUser={removeUser}
              makeAdmin={makeAdmin}
              m={m}
              loginUser={loginUser}
              adminId={adminId}
            />
          ))}
        </TabPanel>
        <TabPanel>
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="tel"
              placeholder="Search friends"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </InputGroup>
          <FriendBox
            searchKeyword={searchKeyword}
            onAddMember={onAddMember}
            addedMembers={addedMembers}
            friends={friends}
            members={members}
          />
          <AddedPeople
            addedMembers={addedMembers}
            onRemoveMember={onRemoveMember}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function Member({
  avatar,
  name,
  m,
  removeUser,
  makeAdmin,
  adminId,
  loginUser,
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Box display="flex" alignItems="center" gap={2} fontSize="small">
        <Avatar src={avatar} size="sm" />
        <Text>{name}</Text>
      </Box>
      {m._id !== adminId && loginUser._id == adminId && (
        <Menu>
          <MenuButton as={DotsVerticalIcon} cursor="pointer" />
          <MenuList>
            <MenuItem onClick={() => removeUser(m)}>Remove</MenuItem>
            <MenuItem onClick={() => makeAdmin(m)}>make Admin</MenuItem>
          </MenuList>
        </Menu>
      )}
      {m._id == adminId && <Code colorScheme="green">Admin</Code>}
    </Box>
  );
}

function FriendBox({
  friends,
  searchKeyword,
  onAddMember,
  addedMembers,
  members,
}) {
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Box>
      {searchKeyword &&
        filteredFriends.map((friend) => (
          <Box
            key={friend._id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={1}
            borderWidth="1px"
            borderRadius="md"
            mb={1}
          >
            <Box display="flex" gap={2} alignItems="center">
              <Avatar size="xs" src={friend.avatar} />
              <Text fontSize="sm">{friend.name}</Text>
            </Box>
            {!members.some((member) => member._id === friend._id) && (
              <Button
                size="sm"
                onClick={() => onAddMember(friend)}
                isDisabled={addedMembers.some(
                  (addedMember) => addedMember._id === friend._id
                )}
              >
                {addedMembers.some(
                  (addedMember) => addedMember._id === friend._id
                )
                  ? "Added"
                  : "Add"}
              </Button>
            )}

            {members.some((member) => member._id === friend._id) && (
              <Code colorScheme="blue">Member</Code>
            )}
          </Box>
        ))}
    </Box>
  );
}

function AddedPeople({ addedMembers, onRemoveMember }) {
  return (
    <Box>
      {addedMembers.map((addedMember) => (
        <Tag
          key={addedMember._id}
          size="lg"
          colorScheme="green"
          borderRadius="full"
          mr={1}
          mb={1}
        >
          <Avatar
            src={addedMember.avatar}
            size="xs"
            name={addedMember.name}
            ml={-1}
            mr={2}
          />
          <TagLabel fontSize="xs">{addedMember.name}</TagLabel>
          <TagCloseButton onClick={() => onRemoveMember(addedMember)} />
        </Tag>
      ))}
    </Box>
  );
}

export default GroupInfo;
