import React from "react";
import { Box, Skeleton, Stack, Spinner } from "@chakra-ui/react";

function MsgSkeleton() {
  return (
    <Stack display="flex" alignItems="center" justifyContent="center" h="100%">
      <Spinner
        thickness="3px"
        speed="0.65s"
        emptyColor="gray.200"
        color="purple.500"
        size="xl"
      />
    </Stack>
  );
}

export default MsgSkeleton;
