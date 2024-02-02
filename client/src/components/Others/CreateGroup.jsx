import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Box,
  Avatar,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import useStore from "../../zustand";
import { SearchIcon } from "@chakra-ui/icons";
import { createGroup } from "../api/api";
import toast from "react-hot-toast";
import socket from "../socket";

export default function GroupModal({ isOpen, onOpen, onClose }) {
  const { friends, chatList, setChatList } = useStore((state) => state);
  const [groupName, setGroupName] = useState("");
  const [addedPeople, setAddedPeople] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const token = localStorage.getItem("token");

  const handleAddFriend = (friend) => {
    setAddedPeople((prevAddedPeople) => [...prevAddedPeople, friend]);
    setSearchKeyword("");
  };

  const handleRemoveFriend = (friend) => {
    setAddedPeople((prevAddedPeople) =>
      prevAddedPeople.filter((addedPerson) => addedPerson._id !== friend._id)
    );
  };

  const handleCreateGroup = async () => {
    if (groupName == "") {
      toast.error("Type a name for group");
      return;
    }

    if (addedPeople.length == 0) {
      toast.error("The group has no members.");
      return;
    }

    const members = addedPeople.map((addedPerson) => addedPerson._id);

    const data = {
      name: groupName,
      members,
    };

    toast.promise(createGroup(token, data), {
      loading: `Creating group`,
      success: (r) => {
        console.log(chatList);
        const newGroup = r.data.NewGroup;
        const updatedChatList = [...chatList, newGroup];
        setChatList(updatedChatList);

        const groupInfo = {
          group: newGroup,
          sendTo: members,
        };

        socket.emit("new group", groupInfo);
        return "Group Created";
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "xs", md: "md" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={2}>
              {/* <FormLabel>Group Name</FormLabel> */}
              <Input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </FormControl>
            <InputGroup mb={2}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Add people"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </InputGroup>
            <Box p={2}>
              <Box mb={2}>
                {addedPeople.map((addedPerson) => (
                  <AddedPeople
                    key={addedPerson._id}
                    person={addedPerson}
                    onRemoveFriend={() => handleRemoveFriend(addedPerson)}
                  />
                ))}
              </Box>
              <Box>
                {searchKeyword.length !== 0 &&
                  filteredFriends.map((friend) => (
                    <FriendBox
                      key={friend._id}
                      friend={friend}
                      onAddFriend={() => handleAddFriend(friend)}
                      addedPeople={addedPeople}
                    />
                  ))}
              </Box>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleCreateGroup}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function FriendBox({ friend, onAddFriend, addedPeople }) {
  const isAdded = addedPeople.some((people) => people._id === friend._id);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      borderWidth="1px"
      borderRadius="md"
    >
      <Box display="flex" gap={2} alignItems="center">
        <Avatar size="sm" src={friend.avatar} />
        <Text>{friend.name}</Text>
      </Box>
      {isAdded ? (
        <Button size="sm" isDisabled>
          Added
        </Button>
      ) : (
        <Button size="sm" onClick={onAddFriend}>
          Add
        </Button>
      )}
    </Box>
  );
}

function AddedPeople({ person, onRemoveFriend }) {
  return (
    <Tag size="lg" colorScheme="green" borderRadius="full" mr={1} mb={1}>
      <Avatar src={person.avatar} size="xs" name={person.name} ml={-1} mr={2} />
      <TagLabel>{person.name}</TagLabel>
      <TagCloseButton onClick={onRemoveFriend} />
    </Tag>
  );
}
