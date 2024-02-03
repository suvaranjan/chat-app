import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  UnorderedList,
  ListItem,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useStore from "../../zustand";
import ProfileModal from "../Others/ProfileModal";

export default function NavDrawer({ isOpen, onOpen, onClose }) {
  const navigate = useNavigate();
  const { setLoginUser, setSelectedChat, loginUser } = useStore(
    (state) => state
  );
  const {
    isOpen: isProfileModalOpen,
    onOpen: onProfileModalOpen,
    onClose: onProfileModalClose,
  } = useDisclosure();

  return (
    <>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>ChatHub</DrawerHeader>

          <DrawerBody>
            <UnorderedList display="flex" flexDirection="column" gap={2}>
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => {
                  navigate("/dashboard");
                  onClose();
                }}
              >
                Dashboard
              </ListItem>
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => {
                  onProfileModalOpen();
                  onClose();
                }}
              >
                Profile
              </ListItem>
              <ListItem
                listStyleType="none"
                cursor="pointer"
                onClick={() => {
                  navigate("/dashboard/friends");
                  onClose();
                }}
              >
                Friends
              </ListItem>
              <ListItem listStyleType="none" cursor="pointer">
                About
              </ListItem>
            </UnorderedList>
          </DrawerBody>

          <DrawerFooter
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
              setLoginUser(null);
              setSelectedChat(null);
              onClose();
            }}
          >
            Logout
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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
