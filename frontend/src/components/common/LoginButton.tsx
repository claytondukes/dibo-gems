import { Button, Icon, Text } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { initGoogleAuth, isAuthenticated, signOut } from '../../services/auth';

// Add Google type definitions
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initGoogleAuth();
        setIsLoggedIn(isAuthenticated());
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = () => {
    window.google.accounts.id.prompt();
  };

  const handleLogout = () => {
    signOut();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <Button
        onClick={handleLogout}
        colorScheme="red"
        variant="outline"
        size="sm"
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      colorScheme="blue"
      variant="solid"
      size="sm"
      leftIcon={<Icon as={FaGoogle} />}
    >
      <Text>Sign in with Google</Text>
    </Button>
  );
};
