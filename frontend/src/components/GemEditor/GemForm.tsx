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
import { useState } from 'react';
import { RankTable } from './RankTable';

interface GemFormProps {
  gem: Gem;
  onSubmit: (gem: Gem) => void;
}

export const GemForm = ({ gem, onSubmit }: GemFormProps) => {
  const [formData, setFormData] = useState<Gem>(gem);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('white', 'gray.800');

  const handleChange = (field: keyof Gem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack spacing={6} align="stretch">
        <Box bg={sectionBg} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
          <Heading size="sm" mb={4}>Basic Information</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
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
                value={formData.stars}
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
                value={formData.description || ''}
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
            ranks={formData.ranks}
            onRankChange={(rank, effects) => {
              setFormData((prev) => ({
                ...prev,
                ranks: {
                  ...prev.ranks,
                  [rank]: {
                    ...prev.ranks[rank],
                    effects
                  }
                }
              }));
            }}
          />
        </Box>
      </VStack>
    </form>
  );
};
