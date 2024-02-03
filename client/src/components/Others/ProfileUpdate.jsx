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
  Input,
} from "@chakra-ui/react";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { userProfileUpdateApi, groupProfileUpdateApi } from "../api/api";
import useStore from "../../zustand";

export default function ProfileUpdate({
  isOpen,
  onOpen,
  onClose,
  header,
  data,
}) {
  const { name, avatar, _id } = data.info;
  const [updatedName, setUpdatedName] = useState(name);
  const [updatedAvatar, setUpdatedAvatar] = useState(avatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  let token = localStorage.getItem("token");
  const { chatList, setChatList, setLoginUser, loginUser } = useStore(
    (state) => state
  );

  useEffect(() => {
    if (!isOpen) {
      setUpdatedName(name);
      setUpdatedAvatar(avatar);
    }
  }, [isOpen, name, avatar]);

  const handleNameChange = (e) => {
    setUpdatedName(e.target.value);
  };

  const handleAvatarChange = () => {
    fileInputRef.current.click();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    handleAvatarUploadLogic(file);
  };

  const handleAvatarUploadLogic = async (file) => {
    setIsUploading(true);

    if (file === undefined) {
      toast.error("Please Select an Image!");
      setIsUploading(false);
      return;
    }

    if (file.type === "image/jpeg" || file.type === "image/png") {
      try {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "suvaranjan");

        const res = axios.post(
          "https://api.cloudinary.com/v1_1/suvaranjan/image/upload",
          data
        );

        toast.promise(res, {
          loading: `Uploading..`,
          success: (res) => {
            setUpdatedAvatar(res.data.url.toString());
            console.log(res.data.url.toString());
            return "Image Uploaded";
          },
          error: (e) => {
            console.log(e);
            return "An error occured";
          },
        });
      } catch (error) {
        console.log(error);
        toast.error("Error uploading image");
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.error("Please Select an Image!");
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (data.type === "user-profile-update") {
        const data = { username: updatedName, avatar: updatedAvatar };

        toast.promise(userProfileUpdateApi(token, data), {
          loading: `Saving..`,
          success: (res) => {
            // console.log(res.data);
            setLoginUser({ ...loginUser, avatar: updatedAvatar });
            return "Saved";
          },
          error: (e) => {
            console.log(e);
            return "An error occured";
          },
        });
      } else {
        const data = {
          groupId: _id,
          name: updatedName,
          avatar: updatedAvatar,
        };
        toast.promise(groupProfileUpdateApi(token, data), {
          loading: `Saving..`,
          success: (res) => {
            // console.log(res.data);
            const updatedChatList = chatList.map((c) => {
              if (c.chat.type === "group" && c.group._id === data.groupId) {
                c.group.avatar = updatedAvatar;
              }
              return c;
            });

            setChatList(updatedChatList);

            return "Saved";
          },
          error: (e) => {
            console.log(e);
            return "An error occured";
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize="md">
            {header}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
              gap={3}
              mb={3}
            >
              <Avatar
                size="lg"
                src={updatedAvatar}
                onClick={handleAvatarChange}
                name={updatedName}
              />
              <Input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
              <Input
                fontWeight="500"
                size="sm"
                value={updatedName}
                onChange={handleNameChange}
              />
              <Button
                size="sm"
                onClick={handleSave}
                isDisabled={isUploading}
                colorScheme="purple"
              >
                Save
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
