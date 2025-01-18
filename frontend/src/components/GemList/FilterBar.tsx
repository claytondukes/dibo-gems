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
} from '@chakra-ui/react';
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  SettingsIcon,
  ArrowUpDownIcon,
} from '@chakra-ui/icons';

interface FilterBarProps {
  search: string;
  stars: string;
  onSearchChange: (value: string) => void;
  onStarsChange: (value: string) => void;
  onToggleColorMode?: () => void;
  colorMode?: 'light' | 'dark';
}

type SortOption = 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc';

export const FilterBar = ({
  search,
  stars,
  onSearchChange,
  onStarsChange,
  onToggleColorMode,
  colorMode = 'light',
}: FilterBarProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
              Sort
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem command="⌘N">Name (A-Z)</MenuItem>
            <MenuItem command="⌘⇧N">Name (Z-A)</MenuItem>
            <Divider />
            <MenuItem command="⌘S">Stars (Low-High)</MenuItem>
            <MenuItem command="⌘⇧S">Stars (High-Low)</MenuItem>
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
          <Tooltip label="Settings">
            <IconButton
              aria-label="Settings"
              icon={<SettingsIcon />}
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
};
