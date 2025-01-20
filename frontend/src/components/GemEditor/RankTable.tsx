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
  Textarea,
} from '@chakra-ui/react';
import { Select as ChakraSelect } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { GemRank, GemEffectType, GemCondition } from '../../types/gem';
import { getEffectTypeTag, effectTypeLabels } from './effectTypeUtils';

interface RankTableProps {
  ranks: Record<string, GemRank>;
  onRankChange: (rank: string, effects: any[]) => void;
}

interface ConditionOption {
  value: GemCondition;
  label: string;
}

const conditionOptions: ConditionOption[] = [
  { value: GemCondition.ON_ATTACK, label: 'On Attack' },
  { value: GemCondition.ON_DASH, label: 'On Dash' },
  { value: GemCondition.ON_SKILL, label: 'On Skill' },
  { value: GemCondition.ON_DAMAGE_TAKEN, label: 'On Damage Taken' },
  { value: GemCondition.ON_KILL, label: 'On Kill' },
  { value: GemCondition.LIFE_THRESHOLD, label: 'Life Threshold' },
  { value: GemCondition.COOLDOWN_RESTRICTION, label: 'Cooldown Restriction' },
  { value: GemCondition.RESONANCE, label: 'Resonance' },
  { value: GemCondition.COMBAT_RATING, label: 'Combat Rating' }
];

export const RankTable = ({ ranks, onRankChange }: RankTableProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');
  const headerBgColor = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  const addEffect = (rank: string) => {
    const currentEffects = ranks[rank]?.effects || [];
    onRankChange(rank, [
      ...currentEffects,
      { type: GemEffectType.PROC, description: '', condition: GemCondition.ON_ATTACK, value: 0 },
    ]);
  };

  const updateEffect = (rank: string, index: number, field: string, value: any) => {
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

          <Box p={4} overflowX="auto" width="100%">
            <Box minWidth="900px">
              <Table variant="simple" size="sm" layout="fixed" width="100%" sx={{
                'td, th': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  padding: '8px',
                },
                '.description-row td': {
                  borderBottom: 'none',
                  paddingBottom: '4px',
                },
                '.fields-row td': {
                  paddingTop: '4px',
                },
                'td.type-cell': { // Increased for "Damage Effect" etc
                  width: '200px',
                  minWidth: '200px',
                },
                'td.condition-cell': { // Increased for "On Attack" etc
                  width: '180px',
                  minWidth: '180px',
                },
                'td.number-cell': {
                  width: '70px',
                  minWidth: '70px',
                },
                'td.action-cell': {
                  width: '40px',
                  minWidth: '40px',
                  padding: '4px',
                }
              }}>
                <Thead bg={headerBgColor}>
                  <Tr>
                    <Th color={textColor}>Type</Th>
                    <Th color={textColor}>Condition</Th>
                    <Th color={textColor}>Value</Th>
                    <Th color={textColor}>Duration</Th>
                    <Th color={textColor}>Cooldown</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {ranks[rank]?.effects?.map((effect, index) => (
                    <>
                      <Tr key={`${index}-description`} className="description-row">
                        <Td colSpan={6}>
                          <Textarea
                            size="sm"
                            value={effect.description}
                            onChange={(e) =>
                              updateEffect(rank, index, 'description', e.target.value)
                            }
                            bg={inputBgColor}
                            color={textColor}
                            rows={3}
                            resize="none"
                            placeholder="Effect description..."
                          />
                        </Td>
                      </Tr>
                      <Tr key={`${index}-fields`} className="fields-row">
                        <Td className="type-cell">
                          <HStack spacing={2}>
                            {getEffectTypeTag(effect.type as GemEffectType)}
                            <ChakraSelect
                              size="sm"
                              value={effect.type}
                              onChange={(e) =>
                                updateEffect(rank, index, 'type', e.target.value)
                              }
                              bg={inputBgColor}
                              color={textColor}
                            >
                              {Object.entries(effectTypeLabels).map(([type, label]) => (
                                <option key={type} value={type}>{label}</option>
                              ))}
                            </ChakraSelect>
                          </HStack>
                        </Td>
                        <Td className="condition-cell">
                          <ChakraSelect
                            size="sm"
                            value={effect.condition}
                            onChange={(e) =>
                              updateEffect(rank, index, 'condition', e.target.value)
                            }
                            bg={inputBgColor}
                            color={textColor}
                          >
                            {conditionOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </ChakraSelect>
                        </Td>
                        <Td className="number-cell">
                          <Input
                            size="sm"
                            type="number"
                            step="1"
                            value={effect.value || 0}
                            onChange={(e) =>
                              updateEffect(rank, index, 'value', parseFloat(e.target.value))
                            }
                            bg={inputBgColor}
                            color={textColor}
                            min={0}
                            max={9999}
                            textAlign="right"
                            paddingRight="4px"
                          />
                        </Td>
                        <Td className="number-cell">
                          <Input
                            size="sm"
                            type="number"
                            step="1"
                            value={effect.duration || 0}
                            onChange={(e) =>
                              updateEffect(rank, index, 'duration', parseFloat(e.target.value))
                            }
                            bg={inputBgColor}
                            color={textColor}
                            min={0}
                            max={999}
                            textAlign="right"
                            paddingRight="4px"
                          />
                        </Td>
                        <Td className="number-cell">
                          <Input
                            size="sm"
                            type="number"
                            step="1"
                            value={effect.cooldown || 0}
                            onChange={(e) =>
                              updateEffect(rank, index, 'cooldown', parseFloat(e.target.value))
                            }
                            bg={inputBgColor}
                            color={textColor}
                            min={0}
                            max={9999}
                            textAlign="right"
                            paddingRight="4px"
                          />
                        </Td>
                        <Td className="action-cell">
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
                    </>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Box>
      ))}
    </VStack>
  );
};
