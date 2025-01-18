import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  FormHelperText,
  Box,
  Heading,
  Divider,
  Tag,
  HStack,
  Text,
  TagLabel,
  TagLeftIcon,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import { Gem, GemEffectType } from '../../types/gem';
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
import { useState } from 'react';

interface GemFormProps {
  gem: Gem;
  onSubmit: (gem: Gem) => void;
}

const effectTypeIcons = {
  [GemEffectType.PROC]: FaBolt,
  [GemEffectType.STAT]: FaChartLine,
  [GemEffectType.DAMAGE]: FaBomb,
  [GemEffectType.SHIELD]: FaShieldAlt,
  [GemEffectType.BUFF]: FaMagic,
  [GemEffectType.DEBUFF]: FaSkull,
  [GemEffectType.SUMMON]: FaGhost,
  [GemEffectType.UTILITY]: FaCog,
};

const effectTypeColors = {
  [GemEffectType.PROC]: 'yellow',
  [GemEffectType.STAT]: 'blue',
  [GemEffectType.DAMAGE]: 'red',
  [GemEffectType.SHIELD]: 'purple',
  [GemEffectType.BUFF]: 'green',
  [GemEffectType.DEBUFF]: 'pink',
  [GemEffectType.SUMMON]: 'cyan',
  [GemEffectType.UTILITY]: 'gray',
};

const effectTypeLabels = {
  [GemEffectType.PROC]: 'Triggered Effect',
  [GemEffectType.STAT]: 'Stat Bonus',
  [GemEffectType.DAMAGE]: 'Damage Effect',
  [GemEffectType.SHIELD]: 'Shield Effect',
  [GemEffectType.BUFF]: 'Buff Effect',
  [GemEffectType.DEBUFF]: 'Debuff Effect',
  [GemEffectType.SUMMON]: 'Summon Effect',
  [GemEffectType.UTILITY]: 'Utility Effect',
};

export const GemForm = ({ gem, onSubmit }: GemFormProps) => {
  const [formData, setFormData] = useState<Gem>(gem);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('white', 'gray.800');

  const handleChange = (field: keyof Gem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getEffectTypeTag = (type: GemEffectType) => {
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

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box bg={sectionBg} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
          <Heading size="sm" mb={4}>Basic Information</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              />
              <FormHelperText>The name of the gem</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Stars</FormLabel>
              <Select
                value={formData.stars}
                onChange={(e) => handleChange('stars', parseInt(e.target.value))}
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={5}>5 Stars</option>
              </Select>
              <FormHelperText>The rarity of the gem</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                rows={3}
                placeholder="Enter a brief description of the gem's effects"
              />
              <FormHelperText>A brief description of the gem's effects</FormHelperText>
            </FormControl>
          </VStack>
        </Box>

        <Box bg={sectionBg} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
          <Heading size="sm" mb={4}>Effect Types</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            This gem contains the following effect types:
          </Text>
          <HStack spacing={2} wrap="wrap">
            {Object.values(formData.ranks['1'].effects).map((effect, index) => (
              <Box key={index} mb={2}>
                {getEffectTypeTag(effect.type as GemEffectType)}
              </Box>
            ))}
          </HStack>
        </Box>

        <HStack justify="flex-end" pt={4}>
          <Button type="submit" colorScheme="blue">
            Save Changes
          </Button>
        </HStack>

        <Divider />
      </VStack>
    </form>
  );
};
