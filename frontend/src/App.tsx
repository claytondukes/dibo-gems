import {
  ChakraProvider,
  Container,
  VStack,
  Heading,
  useDisclosure,
  SimpleGrid,
  useColorMode,
  Box,
  Skeleton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from 'react-query';
import { GemCard } from './components/GemList/GemCard';
import { FilterBar } from './components/GemList/FilterBar';
import { Modal } from './components/common/Modal';
import { GemForm } from './components/GemEditor/GemForm';
import { RankTable } from './components/GemEditor/RankTable';
import { getGems, getGem, updateGem } from './services/api';
import { Gem, GemListItem } from './types/gem';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate the main app content from the providers
function AppContent() {
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc'>('name-asc');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const { data: gems = [], isLoading, error } = useQuery<GemListItem[]>('gems', getGems);

  const updateGemMutation = useMutation(
    ({ stars, name, gem }: { stars: number; name: string; gem: Gem }) =>
      updateGem(stars, name, gem),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gems');
        onClose();
      },
    }
  );

  const filteredAndSortedGems = gems
    .filter((gem) => {
      const matchesSearch = gem.name.toLowerCase().includes(search.toLowerCase());
      const matchesStars = !starFilter || gem.stars.toString() === starFilter;
      return matchesSearch && matchesStars;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'stars-asc':
          return a.stars - b.stars;
        case 'stars-desc':
          return b.stars - a.stars;
        default:
          return 0;
      }
    });

  const handleEditGem = async (gem: GemListItem) => {
    try {
      const fullGem = await getGem(gem.stars, gem.name);
      if (fullGem) {
        console.log('Loaded gem for editing:', fullGem); 
        setSelectedGem(fullGem);
        onOpen();
      }
    } catch (error) {
      console.error('Error loading gem for edit:', error);
      // TODO: Add error toast notification
    }
  };

  const handleSaveGem = async (gem: Gem) => {
    if (!gem || !gem.stars || !gem.name) return;
    
    try {
      await updateGemMutation.mutateAsync({
        stars: gem.stars,
        name: gem.name,
        gem,
      });
      
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries('gems');
      onClose();
    } catch (error) {
      console.error('Error saving gem:', error);
      // TODO: Add error toast notification
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" pb={4}>
          <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Diablo Immortal Gems
          </Heading>
        </Box>
        
        <FilterBar
          search={search}
          stars={starFilter}
          onSearchChange={setSearch}
          onStarsChange={setStarFilter}
          onToggleColorMode={toggleColorMode}
          colorMode={colorMode}
        />

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={6}
          w="100%"
        >
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} height="200px" borderRadius="lg" />
                ))
            : error
            ? <Box>Error loading gems: {error.message}</Box>
            : filteredAndSortedGems.map((gem) => (
                <GemCard
                  key={`${gem.stars}-${gem.name}`}
                  gem={gem}
                  onEdit={() => handleEditGem(gem)}
                />
              ))}
        </SimpleGrid>
      </VStack>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedGem ? `Edit ${selectedGem.name}` : 'Edit Gem'}
        onConfirm={() => selectedGem && handleSaveGem(selectedGem)}
      >
        {selectedGem && (
          <VStack spacing={6} align="stretch">
            <GemForm
              gem={selectedGem}
              onChange={(field, value) =>
                setSelectedGem((prev) =>
                  prev ? { ...prev, [field]: value } : null
                )
              }
            />
            <RankTable
              ranks={selectedGem.ranks}
              onRankChange={(rank, effects) =>
                setSelectedGem((prev) =>
                  prev
                    ? {
                        ...prev,
                        ranks: {
                          ...prev.ranks,
                          [rank]: { effects },
                        },
                      }
                    : null
                )
              }
            />
          </VStack>
        )}
      </Modal>
    </Container>
  );
}

// Main App component with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AppContent />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
