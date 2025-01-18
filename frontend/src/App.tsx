import { ChakraProvider, Container, VStack, Heading, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from 'react-query';
import { GemCard } from './components/GemList/GemCard';
import { FilterBar } from './components/GemList/FilterBar';
import { Modal } from './components/common/Modal';
import { GemForm } from './components/GemEditor/GemForm';
import { RankTable } from './components/GemEditor/RankTable';
import { getGems, getGem, updateGem } from './services/api';
import { Gem, GemListItem } from './types/gem';

const queryClient = new QueryClient();

// Separate the main app content from the providers
function AppContent() {
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: gems = [] } = useQuery<GemListItem[]>('gems', getGems);

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

  const filteredGems = gems.filter((gem) => {
    const matchesSearch = gem.name.toLowerCase().includes(search.toLowerCase());
    const matchesStars = !starFilter || gem.stars.toString() === starFilter;
    return matchesSearch && matchesStars;
  });

  const handleEditGem = async (gem: GemListItem) => {
    const fullGem = await getGem(gem.stars, gem.name);
    setSelectedGem(fullGem);
    onOpen();
  };

  const handleSaveGem = (gem: Gem) => {
    if (!gem || !gem.stars || !gem.name) return;
    updateGemMutation.mutate({
      stars: gem.stars,
      name: gem.name,
      gem,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Diablo Immortal Gems</Heading>
        
        <FilterBar
          search={search}
          stars={starFilter}
          onSearchChange={setSearch}
          onStarsChange={setStarFilter}
        />

        <VStack spacing={4} align="stretch">
          {filteredGems.map((gem) => (
            <GemCard
              key={`${gem.stars}-${gem.name}`}
              gem={gem}
              onEdit={() => handleEditGem(gem)}
            />
          ))}
        </VStack>
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
      <ChakraProvider>
        <AppContent />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
