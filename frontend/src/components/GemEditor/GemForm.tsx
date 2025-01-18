import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  FormHelperText,
  Box,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { Gem } from '../../types/gem';

interface GemFormProps {
  gem: Gem;
  onChange: (field: keyof Gem, value: any) => void;
}

export const GemForm = ({ gem, onChange }: GemFormProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="sm" mb={4}>Basic Information</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={gem.name}
              onChange={(e) => onChange('name', e.target.value)}
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
            />
            <FormHelperText>The name of the gem</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Stars</FormLabel>
            <Select
              value={gem.stars}
              onChange={(e) => onChange('stars', parseInt(e.target.value))}
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={5}>5 Stars</option>
            </Select>
            <FormHelperText>The rarity of the gem</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={gem.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              rows={3}
              placeholder="Enter a brief description of the gem's effects"
            />
            <FormHelperText>A brief description of the gem's effects</FormHelperText>
          </FormControl>
        </VStack>
      </Box>

      <Divider />
    </VStack>
  );
};
