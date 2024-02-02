import React from "react";
import { Box } from "@chakra-ui/react";
import Lottie from "react-lottie";
import animationData from "./loading.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function LoadingMsg() {
  return (
    <Box height="100%">
      <Lottie options={defaultOptions} width={200} />
    </Box>
  );
}
