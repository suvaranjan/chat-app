import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import Lottie from "react-lottie";
import animationData from "./friend.json";
import { useNavigate } from "react-router-dom";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function FriendsAnimation() {
  const navigate = useNavigate();
  return (
    <Box>
      <Box>
        <Lottie options={defaultOptions} width={300} />
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Text textAlign="center">Looks like you have no friends</Text>
        <Button
          size="sm"
          colorScheme="purple"
          onClick={() => navigate("/dashboard/friends")}
        >
          Make Friends
        </Button>
      </Box>
    </Box>
  );
}
