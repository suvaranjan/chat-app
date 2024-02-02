import { Box, Text, Link } from "@chakra-ui/react";
import React from "react";

export default function Footer() {
  return (
    <Box textAlign="center" fontSize=".8rem" p={2}>
      <Text display="inline" mr={2}>
        Built by
      </Text>
      <Link
        display="inline"
        fontWeight="600"
        href="https://suvaranjan.vercel.app/about"
      >
        suvaranjan
      </Link>
    </Box>
  );
}
