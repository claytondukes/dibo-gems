import {
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useColorModeValue,
  Box,
  Heading,
  Button,
  HStack,
  Input,
  Select,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { GemRank, GemEffectType } from '../../types/gem';
import { getEffectTypeTag, effectTypeLabels } from './effectTypeUtils';

interface RankTableProps {
  ranks: Record<string, GemRank>;
  onRankChange: (rank: string, effects: any[]) => void;
}

export const RankTable = ({ ranks, onRankChange }: RankTableProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const headerBgColor = useColorModeValue('gray.100', 'gray.600');

  const addEffect = (rank: string) => {
    const currentEffects = ranks[rank]?.effects || [];
    onRankChange(rank, [
      ...currentEffects,
      { type: GemEffectType.PROC, description: '', conditions: [], value: 0 },
    ]);
  };

  const updateEffect = (rank: string, index: number, field: string, value: string | number | string[]) => {
    const currentEffects = [...(ranks[rank]?.effects || [])];
    currentEffects[index] = { ...currentEffects[index], [field]: value };
    onRankChange(rank, currentEffects);
  };

  const removeEffect = (rank: string, index: number) => {
    const currentEffects = [...(ranks[rank]?.effects || [])];
    currentEffects.splice(index, 1);
    onRankChange(rank, currentEffects);
  };

  return (
    <VStack spacing={6} align="stretch">
      {Object.keys(ranks).map((rank) => (
        <Box key={rank} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <Box bg={headerBgColor} px={6} py={4}>
            <HStack justify="space-between">
              <Heading size="sm">Rank {rank}</Heading>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                onClick={() => addEffect(rank)}
                colorScheme="blue"
                variant="ghost"
              >
                Add Effect
              </Button>
            </HStack>
          </Box>

          <Box p={4}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="20%">Type</Th>
                  <Th width="35%">Description</Th>
                  <Th width="25%">Conditions</Th>
                  <Th width="10%">Value</Th>
                  <Th width="10%"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {ranks[rank]?.effects?.map((effect, index) => (
                  <Tr key={index}>
                    <Td>
                      <HStack spacing={2}>
                        {getEffectTypeTag(effect.type as GemEffectType)}
                        <Select
                          size="sm"
                          value={effect.type}
                          onChange={(e) =>
                            updateEffect(rank, index, 'type', e.target.value)
                          }
                          bg={bgColor}
                        >
                          {Object.entries(effectTypeLabels).map(([type, label]) => (
                            <option key={type} value={type}>{label}</option>
                          ))}
                        </Select>
                      </HStack>
                    </Td>
                    <Td>
                      <Input
                        size="sm"
                        value={effect.description}
                        onChange={(e) =>
                          updateEffect(rank, index, 'description', e.target.value)
                        }
                        bg={bgColor}
                      />
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        value={effect.conditions?.[0] || ''}
                        onChange={(e) =>
                          updateEffect(rank, index, 'conditions', [e.target.value])
                        }
                        bg={bgColor}
                      >
                        <option value="">Select Condition</option>
                        <option value="on_attack">On Attack</option>
                        <option value="on_hit">On Hit</option>
                        <option value="on_kill">On Kill</option>
                        <option value="on_dodge">On Dodge</option>
                        <option value="passive">Passive</option>
                      </Select>
                    </Td>
                    <Td>
                      <Input
                        size="sm"
                        type="number"
                        step="0.1"
                        value={effect.value || 0}
                        onChange={(e) =>
                          updateEffect(rank, index, 'value', parseFloat(e.target.value))
                        }
                        bg={bgColor}
                      />
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Remove effect"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeEffect(rank, index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      ))}
    </VStack>
  );
};
