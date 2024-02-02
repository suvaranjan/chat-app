import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  InputLeftElement,
  Input,
  InputGroup,
  Avatar,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { makeAdminApi } from "../api/api";
import toast from "react-hot-toast";
import useStore from "../../zustand";

function MakeAdmin({ isOpen, onOpen, onClose, members, onConfirm, groupId }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { chatList, setChatList } = useStore((state) => state);
  const token = localStorage.getItem("token");

  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  const handleMakeAdmin = () => {
    const data = {
      groupId,
      memberId: selectedMember._id,
    };

    const newAdmin = {
      name: selectedMember.name,
      _id: selectedMember._id,
      email: selectedMember.email,
      avatar: selectedMember.avatar,
    };

    toast.promise(makeAdminApi(token, data), {
      loading: `Changing Admin to ${selectedMember.name}`,
      success: (r) => {
        const updatedChatList = chatList.map((c) => {
          if (c.chat.type === "group" && c.group._id === groupId) {
            c.group.admin = newAdmin;
          }
          return c;
        });

        setChatList(updatedChatList);
        onClose();
        onConfirm();
        return `${selectedMember.name} is now admin`;
      },
      error: (e) => {
        console.log(e);
        return "An error occured";
      },
    });
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "xs", md: "md" }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Make Admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Box fontSize="sm" mb={2}>
              Before leaving the group, make any member as admin.
            </Box>
            {!selectedMember && (
              <Box>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search Member"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Box mt={2} borderWidth="1px" maxH="100px" overflow="auto">
                  {filteredMembers.map((m) => (
                    <Member
                      key={m._id}
                      avatar={m.avatar}
                      name={m.name}
                      onSelect={() => handleSelectMember(m)}
                    />
                  ))}
                </Box>
              </Box>
            )}
            <Box>
              {selectedMember && (
                <SelectedMemberBox
                  m={selectedMember}
                  onClose={() => setSelectedMember(null)}
                />
              )}
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose} size="sm">
            Close
          </Button>
          <Button
            colorScheme="purple"
            size="sm"
            onClick={handleMakeAdmin}
            isDisabled={!selectedMember}
          >
            Make Admin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Member({ avatar, name, onSelect }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      fontSize="sm"
      p={1}
    >
      <Box display="flex" gap={2} alignItems="center">
        <Avatar size="sm" src={avatar} name={name} />
        <Text>{name}</Text>
      </Box>
      <Box>
        <Button size="xs" onClick={onSelect}>
          Select
        </Button>
      </Box>
    </Box>
  );
}

function SelectedMemberBox({ m, onClose }) {
  return (
    <Tag size="lg" colorScheme="green" borderRadius="full">
      <Avatar src={m.avatar} size="xs" name={m.name} ml={-1} mr={2} />
      <TagLabel>{m.name}</TagLabel>
      <TagCloseButton onClick={onClose} />
    </Tag>
  );
}

export default MakeAdmin;
