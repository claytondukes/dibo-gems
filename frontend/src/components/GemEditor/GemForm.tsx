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
} from '@chakra-ui/react';
import { Gem } from '../../types/gem';
import { RankTable } from './RankTable';

interface GemFormProps {
  gem: Gem;
  onChange: (gem: Gem) => void;
}

export const GemForm = ({ gem, onChange }: GemFormProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('white', 'gray.800');

  const handleChange = (field: keyof Gem, value: any) => {
    onChange({
      ...gem,
      [field]: value,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box bg={sectionBg} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
        <Heading size="sm" mb={4}>Basic Information</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={gem.name}
              onChange={(e) => handleChange('name', e.target.value)}
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
              onChange={(e) => handleChange('stars', parseInt(e.target.value))}
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
              onChange={(e) => handleChange('description', e.target.value)}
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

      <Box bg={sectionBg} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
        <Heading size="sm" mb={4}>Rank Effects</Heading>
        <RankTable
          ranks={gem.ranks}
          onRankChange={(rank, effects) => {
            onChange({
              ...gem,
              ranks: {
                ...gem.ranks,
                [rank]: {
                  ...gem.ranks[rank],
                  effects
                }
              }
            });
          }}
        />
      </Box>
    </VStack>
  );
};
