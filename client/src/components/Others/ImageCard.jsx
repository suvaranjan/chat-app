import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
} from "@chakra-ui/react";

export default function ImageCard({ isOpen, onOpen, onClose, imageSrc }) {
  console.log(imageSrc);
  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize="small">
            Profile Photo
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Image
                objectFit="cover"
                maxW={{ base: "100%", sm: "200px" }}
                src={imageSrc}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
