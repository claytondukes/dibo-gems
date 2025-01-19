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
  Collapse,
  useToast,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, LockIcon, EditIcon } from '@chakra-ui/icons';
import { FaClock } from 'react-icons/fa';
import { GemListItem } from '../../types/gem';
import { useState } from 'react';
import { acquireLock } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { LockInfo } from '../../services/api';

interface GemCardProps {
  gem: GemListItem;
  onEdit: () => void;
  lockInfo?: LockInfo;
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

export const GemCard = ({ gem, onEdit, lockInfo }: GemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useToast();
  const colors = getGemColors(gem.stars);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(colors.border, `${colors.border}80`);

  const handleEdit = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit gems",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await acquireLock(`${gem.stars}-${gem.name}`);
      onEdit();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Gem is Locked",
          description: error.message,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Calculate time remaining if locked
  const getTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - new Date().getTime();
    const minutes = Math.max(0, Math.floor(remaining / (1000 * 60)));
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={lockInfo ? 'red.300' : borderColor}
      overflow="hidden"
      bg={bgColor}
      position="relative"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <Heading size="md" bgGradient={colors.gradient} bgClip="text">
                  {gem.name}
                </Heading>
                <Badge colorScheme={colors.badge} fontSize="0.8em">
                  {gem.stars}★
                </Badge>
              </HStack>
              {lockInfo && (
                <Tag size="sm" colorScheme="red" borderRadius="full">
                  <TagLeftIcon as={FaClock} />
                  <TagLabel>
                    Editing: {lockInfo.user_name} ({getTimeRemaining(lockInfo.expires_at)})
                  </TagLabel>
                </Tag>
              )}
            </VStack>
            <HStack>
              <Tooltip 
                label={lockInfo ? `Currently being edited by ${lockInfo.user_name}` : "Edit gem"}
                placement="top"
              >
                <IconButton
                  icon={lockInfo ? <LockIcon /> : <EditIcon />}
                  aria-label="Edit gem"
                  size="sm"
                  onClick={handleEdit}
                  colorScheme={lockInfo ? "red" : "blue"}
                  variant={lockInfo ? "outline" : "solid"}
                />
              </Tooltip>
              <IconButton
                icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                aria-label={isExpanded ? "Show less" : "Show more"}
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            </HStack>
          </HStack>

          <Text fontSize="sm" color="gray.500" noOfLines={isExpanded ? undefined : 2}>
            {gem.description}
          </Text>

          <Collapse in={isExpanded}>
            <VStack align="flex-start" mt={2} spacing={2}>
              <Text fontWeight="bold">Effects:</Text>
              {gem.effects.map((effect, index) => (
                <Text key={index} fontSize="sm">
                  • {effect}
                </Text>
              ))}
            </VStack>
          </Collapse>
        </VStack>
      </Box>
    </Box>
  );
};
