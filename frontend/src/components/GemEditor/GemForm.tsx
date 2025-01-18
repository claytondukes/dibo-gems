import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Gem } from '../../types/gem';

interface GemFormProps {
  gem: Partial<Gem>;
  onChange: (field: keyof Gem, value: any) => void;
  errors?: Record<string, string>;
}

export const GemForm = ({ gem, onChange, errors = {} }: GemFormProps) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!errors.name}>
        <FormLabel>Name</FormLabel>
        <Input
          value={gem.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <FormErrorMessage>{errors.name}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.stars}>
        <FormLabel>Stars</FormLabel>
        <Select
          value={gem.stars || ''}
          onChange={(e) => onChange('stars', parseInt(e.target.value))}
        >
          <option value={1}>1 Star</option>
          <option value={2}>2 Stars</option>
          <option value={5}>5 Stars</option>
        </Select>
        <FormErrorMessage>{errors.stars}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
