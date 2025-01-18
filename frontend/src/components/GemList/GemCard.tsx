import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Tooltip,
  IconButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { EditIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { GemListItem } from '../../types/gem';
import { useState } from 'react';

interface GemCardProps {
  gem: GemListItem;
  onEdit: () => void;
}

const getGemColors = (stars: number) => {
  switch (stars) {
    case 5:
      return {
        badge: 'yellow',
        border: 'yellow.400',
        gradient: 'linear(to-r, yellow.200, orange.300)',
      };
    case 2:
      return {
        badge: 'blue',
        border: 'blue.400',
        gradient: 'linear(to-r, blue.200, cyan.300)',
      };
    default:
      return {
        badge: 'gray',
        border: 'gray.400',
        gradient: 'linear(to-r, gray.200, gray.300)',
      };
  }
};

export const GemCard = ({ gem, onEdit }: GemCardProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const colors = getGemColors(gem.stars);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(colors.border, `${colors.border}50`);

  return (
    <Box
      borderWidth="2px"
      borderRadius="lg"
      borderColor={isHovered ? borderColor : 'transparent'}
      bg={bgColor}
      p={4}
      position="relative"
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-2px)',
        shadow: 'lg',
        borderColor: borderColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="group"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={colors.gradient}
        opacity={isHovered ? 0.1 : 0}
        transition="opacity 0.2s"
        borderRadius="lg"
        pointerEvents="none"
      />

      <VStack align="start" spacing={3}>
        <HStack justify="space-between" width="100%">
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            {gem.name}
            <Tooltip label={`${gem.stars}-Star Legendary Gem`}>
              <Badge
                colorScheme={colors.badge}
                fontSize="sm"
                px={2}
                borderRadius="full"
              >
                {gem.stars} ★
              </Badge>
            </Tooltip>
          </Heading>
          <Tooltip label="Edit Gem">
            <IconButton
              aria-label="Edit gem"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={onEdit}
              opacity={isHovered ? 1 : 0}
              _groupHover={{ opacity: 1 }}
            />
          </Tooltip>
        </HStack>

        <HStack width="100%" justify="space-between">
          <Text
            color="gray.500"
            fontSize="sm"
            cursor="pointer"
            onClick={onToggle}
            display="flex"
            alignItems="center"
            gap={1}
          >
            {isOpen ? (
              <ChevronUpIcon boxSize={4} />
            ) : (
              <ChevronDownIcon boxSize={4} />
            )}
            {isOpen ? 'Show less' : 'Show more'}
          </Text>
        </HStack>

        <Collapse in={isOpen}>
          <VStack align="start" spacing={2} pt={2}>
            <Text fontSize="sm" color="gray.600">
              {gem.description}
            </Text>
            {gem.effects.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  Base Effects:
                </Text>
                <VStack align="start" spacing={1}>
                  {gem.effects.map((effect, index) => (
                    <Text key={index} fontSize="sm" color="gray.600">
                      • {effect}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};
