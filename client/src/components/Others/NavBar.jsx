import React, { useState } from "react";
import {
  Box,
  UnorderedList,
  ListItem,
  Text,
  Show,
  Hide,
  useColorMode,
  useDisclosure,
  Button,
  useToast,
} from "@chakra-ui/react";
import NavDrawer from "./NavDrawer";
import { useNavigate, useLocation } from "react-router-dom";
import { MoonIcon, HamburgerIcon, SunIcon } from "@chakra-ui/icons";
import useStore from "../../zustand";
import ProfileModal from "./ProfileModal";

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { setLoginUser, setSelectedChat, loginUser } = useStore(
    (state) => state
  );
  const location = useLocation();
  const path = location.pathname;
  const isAuthenticate = path === "/login" || path === "/register";
  const toast = useToast();
  const {
    isOpen: isProfileModalOpen,
    onOpen: onProfileModalOpen,
    onClose: onProfileModalClose,
  } = useDisclosure();

  const navigate = useNavigate();
  const handleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toggleColorMode();
  };

  const handleMenuClick = () => {
    if (!isAuthenticate) {
      onOpen();
    } else {
      toast({
        // title: 'Account created.',
        position: "top-center",
        description: "You are not authorized",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={4}
      >
        <Hide breakpoint="(max-width: 600px)">
          <Box display="flex" gap={6} alignItems="center">
            <Text
              display="inline"
              fontWeight="600"
              // border="1px solid red"
            >
              ChatHub
            </Text>
            <UnorderedList
              gap={7}
              fontSize="sm"
              display={isAuthenticate ? "none" : "flex"}
            >
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </ListItem>
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => {
                  onProfileModalOpen();
                }}
              >
                Profile
              </ListItem>
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => navigate("/dashboard/friends")}
              >
                Friends
              </ListItem>
              <ListItem listStyleType="none" cursor="pointer">
                About
              </ListItem>
            </UnorderedList>
            <Button
              colorScheme="gray"
              size="xs"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
                setLoginUser(null);
                setSelectedChat(null);
              }}
              display={isAuthenticate ? "none" : ""}
            >
              Logout
            </Button>
          </Box>
        </Hide>

        <Show breakpoint="(max-width: 600px)">
          <HamburgerIcon onClick={handleMenuClick} />
        </Show>
        {isDarkMode ? (
          <MoonIcon onClick={handleTheme} />
        ) : (
          <SunIcon onClick={handleTheme} />
        )}
      </Box>

      <NavDrawer isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
      {loginUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onOpen={onProfileModalOpen}
          onClose={onProfileModalClose}
          user={loginUser}
        />
      )}
    </>
  );
}
