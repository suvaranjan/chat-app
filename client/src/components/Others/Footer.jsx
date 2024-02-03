import { Box, Text, Link, useColorMode } from "@chakra-ui/react";
import React from "react";

export default function Footer() {
  const { colorMode } = useColorMode();
  return (
    <Box textAlign="center" fontSize=".8rem" p={2}>
      <Text display="inline" mr={1}>
        Built by
      </Text>
      <Link
        display="inline"
        fontWeight="600"
        href="https://suvaranjan.vercel.app/about"
        color={colorMode === "dark" ? "blue.300" : "blue.500"}
      >
        suvaranjan
      </Link>
    </Box>
  );
}
