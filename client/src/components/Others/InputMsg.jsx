import {
  Box,
  Textarea,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaceIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import React from "react";

export default function InputMsg({
  handleInputTyping,
  handleSend,
  inputMsg,
  openPicker,
  setOpenPicker,
}) {
  const isMd = useBreakpointValue({ base: false, md: true });

  return (
    <>
      <Box display="flex" gap={2}>
        <Box
          display="flex"
          alignItems="center"
          borderWidth={1}
          borderRadius={5}
          pl={2}
          w="100%"
        >
          {isMd && (
            <FaceIcon
              height="25px"
              width="22px"
              onClick={() => setOpenPicker(!openPicker)}
              color="#A0AEC0"
            />
          )}
          <Textarea
            rows={1}
            border="none"
            pl={2}
            placeholder="Message"
            borderColor="transparent"
            focusBorderColor="transparent"
            value={inputMsg}
            onChange={(e) => handleInputTyping(e.target.value)}
            resize="none"
          />
        </Box>
        <IconButton
          aria-label="Send-message"
          icon={<PaperPlaneIcon />}
          isDisabled={inputMsg === ""}
          onClick={handleSend}
          bg="blue.500"
          color="#FAFAFA"
        />
      </Box>
    </>
  );
}
