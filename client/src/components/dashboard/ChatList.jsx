import { Box } from "@chakra-ui/react";
import ChatItem from "./ChatItem";
import useStore from "../../zustand";
// import InputSerch from "../Others/InputSerch";
import { useState } from "react";
import ChatSkeleton from "../Others/ChatSkeleton";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import GroupModal from "../Others/CreateGroup";
import FriendsAnimation from "../lottie/FriendsAnimation";

export default function ChatList({ loading, handleChatClick }) {
  const { chatList } = useStore((state) => state);
  const [inputText, setInputText] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filteredChatList = chatList.filter((chatItem) => {
    const name = chatItem.friend?.name || chatItem.group?.name || "";
    return name.toLowerCase().includes(inputText.toLowerCase());
  });

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" alignItems="center" gap={3} p={2}>
          <InputGroup mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </InputGroup>
          <Menu>
            <MenuButton
              as={DotsVerticalIcon}
              cursor="pointer"
              width={22}
              height={30}
            />
            <MenuList>
              <MenuItem onClick={onOpen}>Create group</MenuItem>
            </MenuList>
          </Menu>
        </Box>
        {!loading ? (
          <Box>
            {filteredChatList.map((c, i) => {
              return (
                <ChatItem chat={c} key={i} handleChatClick={handleChatClick} />
              );
            })}
          </Box>
        ) : (
          <Box>
            <ChatSkeleton required={8} />
          </Box>
        )}
        {!loading && chatList.length === 0 && <FriendsAnimation />}
      </Box>
      {!loading && (
        <GroupModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
      )}
    </>
  );
}
