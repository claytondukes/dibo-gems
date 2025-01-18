import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalProps as ChakraModalProps,
} from '@chakra-ui/react';
import { Button } from './Button';

interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  showFooter?: boolean;
}

export const Modal = ({
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  showFooter = true,
  ...props
}: ModalProps) => {
  return (
    <ChakraModal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        {showFooter && (
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={props.onClose}>
              Cancel
            </Button>
            {onConfirm && (
              <Button colorScheme="blue" onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};
