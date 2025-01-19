import { Button } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { initGoogleAuth, isAuthenticated, signOut, authStateChange } from '../../services/auth';

// Add Google type definitions
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            ux_mode?: 'popup' | 'redirect';
            allowed_parent_origin?: string;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

export const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

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

    const handleAuthChange = () => setIsLoggedIn(isAuthenticated());
    authStateChange.addEventListener('change', handleAuthChange);
    return () => authStateChange.removeEventListener('change', handleAuthChange);
  }, []);

  // Render Google Sign-In button whenever buttonRef is available and user is not logged in
  useEffect(() => {
    if (!isLoggedIn && buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      });
    }
  }, [isLoggedIn, buttonRef.current]);

  if (isLoading) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <Button
        onClick={signOut}
        colorScheme="red"
        variant="outline"
        size="sm"
      >
        Sign Out
      </Button>
    );
  }

  return <div ref={buttonRef} />;
};
