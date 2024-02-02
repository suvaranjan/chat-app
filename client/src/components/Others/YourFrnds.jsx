import { Avatar, Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import Alert from "./Alert";

function YourFrnds({ friend, handleDeleteFriend, handleMessage }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        display="flex"
        gap={3}
        alignItems="center"
        borderWidth="1px"
        padding={3}
        borderRadius="md"
        mb={2}
      >
        <Box>
          <Avatar name={friend.name} src={friend.avatar} />
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>{friend.name}</Box>
          <Box display="flex" gap={2}>
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => onOpen()}
              fontWeight="400"
            >
              Delete
            </Button>
            <Button
              colorScheme="cyan"
              size="sm"
              onClick={() => handleMessage(friend)}
              fontWeight="400"
            >
              Message
            </Button>
          </Box>
        </Box>
      </Box>
      <Alert
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        message={`Are you sure to remove ${friend.name} from friends`}
        onConfirm={() => handleDeleteFriend(friend)}
      />
    </>
  );
}

export default YourFrnds;
