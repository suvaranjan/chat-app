import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import Lottie from "react-lottie";
import animationData from "./hello.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function HelloHi({ sayHello }) {
  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      onClick={() => sayHello()}
    >
      <Lottie options={defaultOptions} width={300} />
    </Box>
  );
}
