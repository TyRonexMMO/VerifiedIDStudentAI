interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface GroupMember {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    is_bot: boolean;
  };
  status: string;
}

interface TelegramAuthResponse {
  success: boolean;
  user?: TelegramUser;
  message?: string;
}

interface GroupMembersResponse {
  success: boolean;
  members?: GroupMember[];
  message?: string;
}

/**
 * Telegram authentication service for handling Telegram bot authentication
 * and group member verification
 */
class TelegramService {
  private botToken: string | null = null;
  private groupChatId: string | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000';
  }

  /**
   * Initialize the Telegram service with bot token and group chat ID
   */
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/telegram/config`);
      const config = await response.json();
      
      if (config.success) {
        this.botToken = config.botToken;
        this.groupChatId = config.groupChatId;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Telegram service:', error);
      return false;
    }
  }

  /**
   * Validate Telegram authentication data
   */
  private validateTelegramAuth(authData: any): boolean {
    // Basic validation - in production, you should implement proper hash validation
    const requiredFields = ['id', 'first_name', 'auth_date', 'hash'];
    return requiredFields.every(field => authData[field] !== undefined);
  }

  /**
   * Check if user is a member of the authorized group
   */
  async verifyGroupMembership(userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/telegram/verify-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      return result.success && result.isMember;
    } catch (error) {
      console.error('Error verifying group membership:', error);
      return false;
    }
  }

  /**
   * Get all group members
   */
  async getGroupMembers(): Promise<GroupMembersResponse> {
    try {
      const response = await fetch(`${this.serverUrl}/api/telegram/group-members`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return { success: false, message: 'Failed to fetch group members' };
    }
  }

  /**
   * Handle Telegram authentication callback
   */
  async handleTelegramAuth(authData: any): Promise<TelegramAuthResponse> {
    try {
      // Validate auth data structure
      if (!this.validateTelegramAuth(authData)) {
        return { success: false, message: 'Invalid authentication data' };
      }

      // Verify group membership
      const isMember = await this.verifyGroupMembership(authData.id);
      if (!isMember) {
        return { 
          success: false, 
          message: 'You are not a member of the authorized group. Please join the group first.' 
        };
      }

      // Return successful authentication
      return {
        success: true,
        user: authData as TelegramUser,
      };
    } catch (error) {
      console.error('Telegram authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  /**
   * Generate Telegram login widget URL
   */
  generateLoginWidget(botUsername: string, redirectUrl?: string): string {
    const params = new URLSearchParams({
      bot_id: botUsername,
      origin: window.location.origin,
      request_access: 'write',
    });

    if (redirectUrl) {
      params.append('return_to', redirectUrl);
    }

    return `https://oauth.telegram.org/auth?${params.toString()}`;
  }

  /**
   * Create Telegram login button
   */
  createLoginButton(
    containerId: string, 
    botUsername: string, 
    onAuth: (user: TelegramUser) => void,
    buttonSize: 'large' | 'medium' | 'small' = 'large',
    cornerRadius?: number
  ): void {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container element not found:', containerId);
      return;
    }

    // Create Telegram login widget script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-request-access', 'write');
    
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }

    // Set up authentication callback
    (window as any).onTelegramAuth = async (user: TelegramUser) => {
      const authResult = await this.handleTelegramAuth(user);
      if (authResult.success && authResult.user) {
        onAuth(authResult.user);
      } else {
        alert(authResult.message || 'Authentication failed');
      }
    };

    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    
    // Clear container and append script
    container.innerHTML = '';
    container.appendChild(script);
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('telegram_user');
    sessionStorage.removeItem('telegram_user');
  }

  /**
   * Store user data in local storage
   */
  storeUserData(user: TelegramUser): void {
    localStorage.setItem('telegram_user', JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  getStoredUserData(): TelegramUser | null {
    try {
      const userData = localStorage.getItem('telegram_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving stored user data:', error);
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const userData = this.getStoredUserData();
    if (!userData) return false;

    // Check if auth data is not too old (optional - implement your own logic)
    const authAge = Date.now() / 1000 - userData.auth_date;
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    
    return authAge < maxAge;
  }

  /**
   * Get display name for user
   */
  getUserDisplayName(user: TelegramUser): string {
    if (user.username) {
      return `@${user.username}`;
    }
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || `User ${user.id}`;
  }
}

// Export singleton instance
export const telegramService = new TelegramService();
export type { TelegramUser, GroupMember, TelegramAuthResponse, GroupMembersResponse };