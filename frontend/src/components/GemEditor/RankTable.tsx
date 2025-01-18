import {
  VStack,
  Box,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Table } from '../common/Table';
import { GemRank, GemEffect } from '../../types/gem';

interface RankTableProps {
  ranks: Record<string, GemRank>;
  onRankChange: (rank: string, effects: GemEffect[]) => void;
}

export const RankTable = ({ ranks, onRankChange }: RankTableProps) => {
  const addEffect = (rank: string) => {
    const currentRank = ranks[rank] || { effects: [] };
    onRankChange(rank, [
      ...currentRank.effects,
      { type: '', description: '', conditions: [] },
    ]);
  };

  const removeEffect = (rank: string, index: number) => {
    const currentRank = ranks[rank];
    if (!currentRank) return;

    const newEffects = [...currentRank.effects];
    newEffects.splice(index, 1);
    onRankChange(rank, newEffects);
  };

  const updateEffect = (
    rank: string,
    index: number,
    field: keyof GemEffect,
    value: any
  ) => {
    const currentRank = ranks[rank];
    if (!currentRank) return;

    const newEffects = [...currentRank.effects];
    newEffects[index] = { ...newEffects[index], [field]: value };
    onRankChange(rank, newEffects);
  };

  return (
    <VStack spacing={4} align="stretch">
      {Object.entries(ranks).map(([rank, data]) => (
        <Box key={rank}>
          <HStack justify="space-between" mb={2}>
            <Box fontWeight="bold">Rank {rank}</Box>
            <IconButton
              aria-label="Add effect"
              icon={<AddIcon />}
              size="sm"
              onClick={() => addEffect(rank)}
            />
          </HStack>
          <Table
            headers={['Type', 'Description', 'Actions']}
            data={data.effects.map((effect, index) => [
              effect.type,
              effect.description,
              <IconButton
                key={index}
                aria-label="Delete effect"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                onClick={() => removeEffect(rank, index)}
              />,
            ])}
          />
        </Box>
      ))}
    </VStack>
  );
};
