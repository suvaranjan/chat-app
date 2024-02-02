import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Avatar,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import ProfileUpdate from "./ProfileUpdate";
import useStore from "../../zustand";

export default function ProfileModal({ isOpen, onOpen, onClose, user }) {
  const {
    isOpen: isProfileUpdateOpen,
    onOpen: onProfileUpdateOpen,
    onClose: onProfileUpdateClose,
  } = useDisclosure();

  const { loginUser } = useStore((state) => state);

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
              gap={2}
              mb={3}
            >
              <Avatar size="lg" src={user.avatar} name={user.name} />
              <Text fontWeight="500">{user.name}</Text>
              {loginUser._id === user._id && (
                <Button
                  size="xs"
                  onClick={() => {
                    onClose();
                    onProfileUpdateOpen();
                  }}
                >
                  Update
                </Button>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <ProfileUpdate
        isOpen={isProfileUpdateOpen}
        onOpen={onProfileUpdateOpen}
        onClose={onProfileUpdateClose}
        header="Profile Update"
        data={{ info: user, type: "user-profile-update" }}
      />
    </Box>
  );
}
