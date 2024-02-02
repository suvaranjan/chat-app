import { Box, Input, InputRightElement, InputGroup } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export default function InputSerch({ InputText, setInputText, handleSearch }) {
  return (
    <Box w="100%">
      <InputGroup>
        <InputRightElement>
          <SearchIcon
            // color="gray.300"
            cursor="pointer"
            onClick={handleSearch}
          />
        </InputRightElement>
        <Input
          type="tel"
          placeholder="Search"
          value={InputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </InputGroup>
    </Box>
  );
}
