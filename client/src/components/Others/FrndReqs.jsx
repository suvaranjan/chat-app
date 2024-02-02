import { Avatar, Box, Button, Text } from "@chakra-ui/react";

function FrndReqs({
  user,
  handleReqAccept,
  handleReqReject,
  isAccepting,
  isRejecting,
  rejectingUserId,
  acceptingUserId,
}) {
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
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>{user.name}</Box>
        <Box display="flex" gap={2}>
          <Button
            colorScheme="red"
            size="sm"
            onClick={() => handleReqReject(user)}
            fontWeight="400"
            isLoading={isRejecting && rejectingUserId == user._id}
            loadingText="Rejecting"
          >
            Reject
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            onClick={() => handleReqAccept(user)}
            fontWeight="400"
            isLoading={isAccepting && acceptingUserId == user._id}
            loadingText="Accepting"
          >
            Accept
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default FrndReqs;
