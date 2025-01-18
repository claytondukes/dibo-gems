import {
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface FilterBarProps {
  search: string;
  stars: string;
  onSearchChange: (value: string) => void;
  onStarsChange: (value: string) => void;
}

export const FilterBar = ({
  search,
  stars,
  onSearchChange,
  onStarsChange,
}: FilterBarProps) => {
  return (
    <HStack spacing={4} w="100%" mb={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search gems..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      <Select
        value={stars}
        onChange={(e) => onStarsChange(e.target.value)}
        w="200px"
      >
        <option value="">All Stars</option>
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="5">5 Stars</option>
      </Select>
    </HStack>
  );
};
