import React, { useState, useEffect } from 'react';
import { telegramService, TelegramUser } from '../services/telegramService';

interface LoginPageProps {
  onLoginSuccess: (user?: TelegramUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [botUsername, setBotUsername] = useState('');
  const [showUsernameLogin, setShowUsernameLogin] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Telegram service and check if it's configured
    const initializeTelegram = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/telegram/config');
        const config = await response.json();
        
        if (config.success && config.botUsername) {
          setTelegramConfigured(true);
          setBotUsername(config.botUsername);
          
          // Check if user is already authenticated
          if (telegramService.isAuthenticated()) {
            const userData = telegramService.getStoredUserData();
            if (userData) {
              onLoginSuccess(userData);
              return;
            }
          }

          // Set up Telegram login widget after a short delay
          setTimeout(() => {
            setupTelegramLoginWidget(config.botUsername);
          }, 100);
          
          // Fetch group members for username login
          await fetchGroupMembers();
        } else {
          console.error('Telegram configuration failed:', config);
          setTelegramConfigured(false);
        }
      } catch (error) {
        console.error('Failed to initialize Telegram:', error);
        setTelegramConfigured(false);
      }
    };

    initializeTelegram();
  }, [onLoginSuccess]);

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/telegram/group-members');
      const result = await response.json();
      if (result.success && result.members) {
        setGroupMembers(result.members);
      }
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    }
  };

  const setupTelegramLoginWidget = (botUsername: string) => {
    if (!botUsername) return;

    telegramService.createLoginButton(
      'telegram-login-container',
      botUsername,
      handleTelegramAuth,
      'large',
      10
    );
  };

  const handleTelegramAuth = async (user: TelegramUser) => {
    setLoading(true);
    setError('');
    
    try {
      const authResult = await telegramService.handleTelegramAuth(user);
      
      if (authResult.success && authResult.user) {
        // Store user data
        telegramService.storeUserData(authResult.user);
        onLoginSuccess(authResult.user);
      } else {
        setError(authResult.message || 'Telegram authentication failed');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Admin fallback login
      if (username === 'AdminTYRonex') {
        const adminUser: TelegramUser = {
          id: 999999999,
          first_name: 'Admin',
          username: 'AdminTYRonex',
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'admin_access'
        };
        telegramService.storeUserData(adminUser);
        onLoginSuccess(adminUser);
        setLoading(false);
        return;
      }

      // Use the new username login API endpoint
      const response = await fetch('http://localhost:3000/api/telegram/username-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        telegramService.storeUserData(result.user);
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Username not found in authorized Telegram group. Please make sure you are a member of the group and have a username set.');
      }
    } catch (error) {
      console.error('Username login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUsernameLogin = () => {
    setShowUsernameLogin(!showUsernameLogin);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full m-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {telegramConfigured ? 'Telegram Login' : 'Login Required'}
          </h2>
          <p className="text-gray-500">
            {telegramConfigured ? (
              showUsernameLogin ? 
                'Enter your Telegram username to access the generator.' :
                'Login with your Telegram account to access the generator.'
            ) : (
              'Telegram authentication is not configured.'
            )}
          </p>
        </div>

        {loading && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Authenticating...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {telegramConfigured ? (
          <div>
            {!showUsernameLogin ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Click the button below to login with Telegram:
                  </p>
                  <div id="telegram-login-container" className="flex justify-center"></div>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleUsernameLogin}
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Login with Telegram username instead
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <form onSubmit={handleUsernameLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Telegram Username
                    </label>
                    <div className="mt-1">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@your_telegram_username or username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter your Telegram username (with or without @)
                    </p>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Checking...' : 'Login with Username'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleUsernameLogin}
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Use Telegram widget instead
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Telegram authentication is not properly configured. Please contact the administrator.
              </p>
            </div>
            
            {/* Emergency admin access */}
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div>
                <input
                  id="emergency-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Emergency access username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Emergency Access'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Contact me on Telegram:{' '}
            <a
              href="https://t.me/TYRoneX97"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              @TYRoneX97
            </a>
          </p>
          {telegramConfigured && (
            <p className="mt-2 text-xs text-gray-500">
              Make sure you're a member of the authorized Telegram group to login.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
