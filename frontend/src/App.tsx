import {
  ChakraProvider,
  Container,
  VStack,
  Heading,
  useDisclosure,
  SimpleGrid,
  useColorMode,
  Skeleton,
  HStack,
  Spacer,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from 'react-query';
import { GemCard } from './components/GemList/GemCard';
import { FilterBar } from './components/GemList/FilterBar';
import { Modal } from './components/common/Modal';
import { GemForm } from './components/GemEditor/GemForm';
import { getGems, getGem, updateGem, getLocks, releaseLock, LockInfo } from './services/api';
import { Gem, GemListItem } from './types/gem';
import { theme } from './theme';
import { LoginButton } from './components/common/LoginButton';

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
  const [searchDesc, setSearchDesc] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch gems
  const { data: gems = [], isLoading: gemsLoading, error: gemsError } = useQuery<GemListItem[], Error>(
    'gems',
    getGems
  );

  // Fetch locks only when needed
  const { data: locks = {}, refetch: refetchLocks } = useQuery<Record<string, LockInfo>>(
    'locks',
    getLocks,
    {
      enabled: false, // Don't fetch automatically
    }
  );

  const updateGemMutation = useMutation(
    ({ stars, name, gem }: { stars: number; name: string; gem: Gem }) =>
      updateGem(stars, name, gem),
    {
      onSuccess: async () => {
        if (selectedGem) {
          try {
            await releaseLock(`${selectedGem.stars}-${selectedGem.name}`);
            queryClient.invalidateQueries('locks');
          } catch (error) {
            console.error('Error releasing lock:', error);
          }
        }
        queryClient.invalidateQueries('gems');
        onClose();
        setSelectedGem(null);
        toast({
          title: "Gem Updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: "Error Updating Gem",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const handleGemClick = async (gem: GemListItem) => {
    try {
      // Fetch latest locks before attempting to edit
      await refetchLocks();
      const fullGem = await getGem(gem.stars, gem.name);
      setSelectedGem(fullGem);
      onOpen();
    } catch (error) {
      toast({
        title: "Error Loading Gem",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveGem = async (updatedGem: Gem) => {
    if (!selectedGem || !updatedGem) return;
    
    updateGemMutation.mutate({
      stars: updatedGem.stars,
      name: updatedGem.name,
      gem: updatedGem
    });
  };

  const handleCloseEditor = async () => {
    setSelectedGem(null);
    onClose();
  };

  const filteredAndSortedGems = gems
    .filter((gem) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = gem.name.toLowerCase().includes(searchLower) ||
        (searchDesc && gem.description.toLowerCase().includes(searchLower));
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

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack>
          <Heading as="h1" size="xl">
            Diablo Immortal Gems
          </Heading>
          <Spacer />
          <LoginButton />
        </HStack>
        
        <FilterBar
          search={search}
          stars={starFilter}
          sortOrder={sortOrder}
          searchDesc={searchDesc}
          onSearchChange={setSearch}
          onStarsChange={setStarFilter}
          onSortChange={setSortOrder}
          onSearchDescChange={setSearchDesc}
          onToggleColorMode={toggleColorMode}
          colorMode={colorMode}
        />

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {gemsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))
          ) : gemsError ? (
            <Text color="red.500">Error loading gems: {gemsError.message}</Text>
          ) : (
            filteredAndSortedGems.map((gem) => (
              <GemCard
                key={`${gem.stars}-${gem.name}`}
                gem={gem}
                onEdit={() => handleGemClick(gem)}
                lockInfo={locks[`${gem.stars}-${gem.name}`]}
              />
            ))
          )}
        </SimpleGrid>
      </VStack>

      {selectedGem && (
        <Modal
          isOpen={isOpen}
          onClose={handleCloseEditor}
          onConfirm={() => handleSaveGem(selectedGem!)}
          title={selectedGem ? `Edit ${selectedGem.name}` : 'Edit Gem'}
          size="4xl"
        >
          <GemForm
            gem={selectedGem}
            onSubmit={handleSaveGem}
          />
        </Modal>
      )}
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
