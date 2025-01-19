import {
  Tag,
  TagLeftIcon,
  TagLabel,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FaBolt, // PROC
  FaChartLine, // STAT
  FaBomb, // DAMAGE
  FaShieldAlt, // SHIELD
  FaMagic, // BUFF
  FaSkull, // DEBUFF
  FaGhost, // SUMMON
  FaCog, // UTILITY
} from 'react-icons/fa';
import { GemEffectType } from '../../types/gem';

export const effectTypeIcons = {
  [GemEffectType.PROC]: FaBolt,
  [GemEffectType.STAT]: FaChartLine,
  [GemEffectType.DAMAGE]: FaBomb,
  [GemEffectType.SHIELD]: FaShieldAlt,
  [GemEffectType.BUFF]: FaMagic,
  [GemEffectType.DEBUFF]: FaSkull,
  [GemEffectType.SUMMON]: FaGhost,
  [GemEffectType.UTILITY]: FaCog,
};

export const effectTypeColors = {
  [GemEffectType.PROC]: 'yellow',
  [GemEffectType.STAT]: 'blue',
  [GemEffectType.DAMAGE]: 'red',
  [GemEffectType.SHIELD]: 'purple',
  [GemEffectType.BUFF]: 'green',
  [GemEffectType.DEBUFF]: 'pink',
  [GemEffectType.SUMMON]: 'cyan',
  [GemEffectType.UTILITY]: 'gray',
};

export const effectTypeLabels = {
  [GemEffectType.PROC]: 'Triggered Effect',
  [GemEffectType.STAT]: 'Stat Bonus',
  [GemEffectType.DAMAGE]: 'Damage Effect',
  [GemEffectType.SHIELD]: 'Shield Effect',
  [GemEffectType.BUFF]: 'Buff Effect',
  [GemEffectType.DEBUFF]: 'Debuff Effect',
  [GemEffectType.SUMMON]: 'Summon Effect',
  [GemEffectType.UTILITY]: 'Utility Effect',
};

export const getEffectTypeTag = (type: GemEffectType) => {
  const Icon = effectTypeIcons[type];
  return (
    <Tooltip label={effectTypeLabels[type]}>
      <Tag size="md" variant="subtle" colorScheme={effectTypeColors[type]}>
        <TagLeftIcon as={Icon} />
        <TagLabel>{type.split('_')[0].toUpperCase()}</TagLabel>
      </Tag>
    </Tooltip>
  );
};
