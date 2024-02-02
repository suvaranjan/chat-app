import React from "react";
import { Box, Skeleton, SkeletonCircle } from "@chakra-ui/react";

function ChatSkeleton({ required }) {
  // Create an array with the specified length
  const skeletonArray = Array.from({ length: required });

  return (
    <>
      {skeletonArray.map((_, index) => (
        <Box key={index} padding="3" boxShadow="lg" w="100%" display="flex">
          <SkeletonCircle size="12" />
          <Box flex="1" display="flex" flexDirection="column" gap={2}>
            <Skeleton flex="1" ml="4" />
            <Skeleton flex="1" ml="4" />
          </Box>
        </Box>
      ))}
    </>
  );
}

export default ChatSkeleton;
