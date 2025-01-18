import { Box, Heading, Text, Badge, VStack, HStack } from '@chakra-ui/react';
import { GemListItem } from '../../types/gem';
import { Button } from '../common/Button';

interface GemCardProps {
  gem: GemListItem;
  onEdit: () => void;
}

export const GemCard = ({ gem, onEdit }: GemCardProps) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack align="start" spacing={2}>
        <HStack justify="space-between" width="100%">
          <Heading size="md">{gem.name}</Heading>
          <Badge colorScheme={gem.stars === 5 ? 'yellow' : 'blue'}>
            {gem.stars} ★
          </Badge>
        </HStack>
        <Text color="gray.600" fontSize="sm">
          Path: {gem.file_path}
        </Text>
        <Button size="sm" onClick={onEdit}>
          Edit
        </Button>
      </VStack>
    </Box>
  );
};
