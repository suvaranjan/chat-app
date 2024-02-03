import React from "react";
import { Box } from "@chakra-ui/react";
import Lottie from "react-lottie";
import animationData from "./search.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function SearchAnimation() {
  return (
    <Box height="100%">
      <Lottie options={defaultOptions} width={300} />
    </Box>
  );
}
