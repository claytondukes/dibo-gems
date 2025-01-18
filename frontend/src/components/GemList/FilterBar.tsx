import {
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  useColorModeValue,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  Text,
  Checkbox,
} from '@chakra-ui/react';
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  ArrowUpDownIcon,
} from '@chakra-ui/icons';

interface FilterBarProps {
  search: string;
  stars: string;
  sortOrder: 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc';
  searchDesc: boolean;
  onSearchChange: (value: string) => void;
  onStarsChange: (value: string) => void;
  onSortChange: (value: 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc') => void;
  onSearchDescChange: (value: boolean) => void;
  onToggleColorMode?: () => void;
  colorMode?: 'light' | 'dark';
}

type SortOption = 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc';

export const FilterBar = ({
  search,
  stars,
  sortOrder,
  searchDesc,
  onSearchChange,
  onStarsChange,
  onSortChange,
  onSearchDescChange,
  onToggleColorMode,
  colorMode = 'light',
}: FilterBarProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'name-asc': return 'Name (A-Z)';
      case 'name-desc': return 'Name (Z-A)';
      case 'stars-asc': return 'Stars (Low-High)';
      case 'stars-desc': return 'Stars (High-Low)';
      default: return 'Sort';
    }
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      mb={6}
    >
      <HStack spacing={4} wrap="wrap">
        <InputGroup maxW={{ base: '100%', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search gems..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            _focus={{
              borderColor: 'blue.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
            }}
          />
        </InputGroup>

        <Checkbox
          isChecked={searchDesc}
          onChange={(e) => onSearchDescChange(e.target.checked)}
          colorScheme="blue"
          size="md"
        >
          Search descriptions
        </Checkbox>

        <Select
          value={stars}
          onChange={(e) => onStarsChange(e.target.value)}
          maxW={{ base: '100%', md: '200px' }}
          _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
          }}
        >
          <option value="">All Stars</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="5">5 Stars</option>
        </Select>

        <Menu>
          <Tooltip label="Sort options">
            <MenuButton
              as={Button}
              rightIcon={<ArrowUpDownIcon />}
              variant="outline"
              size="md"
            >
              {getSortLabel(sortOrder)}
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem
              command="⌘N"
              onClick={() => onSortChange('name-asc')}
              icon={sortOrder === 'name-asc' ? <ArrowUpDownIcon /> : undefined}
            >
              Name (A-Z)
            </MenuItem>
            <MenuItem
              command="⌘⇧N"
              onClick={() => onSortChange('name-desc')}
              icon={sortOrder === 'name-desc' ? <ArrowUpDownIcon /> : undefined}
            >
              Name (Z-A)
            </MenuItem>
            <Divider />
            <MenuItem
              command="⌘S"
              onClick={() => onSortChange('stars-asc')}
              icon={sortOrder === 'stars-asc' ? <ArrowUpDownIcon /> : undefined}
            >
              Stars (Low-High)
            </MenuItem>
            <MenuItem
              command="⌘⇧S"
              onClick={() => onSortChange('stars-desc')}
              icon={sortOrder === 'stars-desc' ? <ArrowUpDownIcon /> : undefined}
            >
              Stars (High-Low)
            </MenuItem>
          </MenuList>
        </Menu>

        <Box flex={1} />

        <HStack spacing={2}>
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={onToggleColorMode}
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
};
