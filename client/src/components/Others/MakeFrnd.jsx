import { Avatar, Box, Button } from "@chakra-ui/react";
import useStore from "../../zustand";

function MakeFrnd({
  user,
  handleAddFriend,
  handleMessage,
  isAdding,
  addingUserId,
}) {
  const { friends, friendRequestsSent } = useStore((state) => state);

  const isFriend = friends.some((friend) => friend._id === user._id);
  const isRequestSent = friendRequestsSent.some(
    (request) => request._id === user._id
  );

  return (
    <Box
      display="flex"
      gap={3}
      alignItems="center"
      borderWidth="1px"
      padding={3}
      borderRadius="md"
    >
      <Box>
        <Avatar name={user.name} src={user.avatar} />
      </Box>
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>{user.name}</Box>
        <Box display="flex" gap={2}>
          {isFriend && (
            <Button
              colorScheme="purple"
              fontWeight="400"
              size="sm"
              onClick={() => handleMessage(user)}
            >
              Message
            </Button>
          )}
          {isRequestSent && (
            <Button size="sm" isDisabled fontWeight="400">
              Requested
            </Button>
          )}
          {!isFriend && !isRequestSent && (
            <Button
              colorScheme="messenger"
              size="sm"
              onClick={() => handleAddFriend(user)}
              fontWeight="400"
              isLoading={isAdding && addingUserId == user._id}
              loadingText="Requesting"
            >
              Add Friend
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default MakeFrnd;
