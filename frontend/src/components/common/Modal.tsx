import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalCloseButton,
  useColorModeValue,
} from '@chakra-ui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
}

export const Modal = ({ isOpen, onClose, onConfirm, title, children, size = '2xl' }: ModalProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="xl"
        mx={4}
        as="form"
        onSubmit={handleSubmit}
      >
        <ModalHeader
          borderBottomWidth="1px"
          borderColor={borderColor}
          py={4}
          fontSize="lg"
          fontWeight="bold"
        >
          {title}
        </ModalHeader>
        <ModalCloseButton size="lg" onClick={onClose} />
        
        <ModalBody py={6}>
          {children}
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={borderColor}
          py={4}
        >
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
};
