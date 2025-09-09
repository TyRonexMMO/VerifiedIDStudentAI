const crypto = require('crypto');
const axios = require('axios');

/**
 * Server-side Telegram authentication and group management utilities
 */
class TelegramServerService {
  constructor(botToken, groupChatId) {
    this.botToken = botToken;
    this.groupChatId = groupChatId;
    this.telegramApiBase = 'https://api.telegram.org/bot';
  }

  /**
   * Validate Telegram authentication data hash
   */
  validateTelegramAuth(authData) {
    const { hash, ...data } = authData;
    
    // Create data-check-string
    const dataCheckString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto.createHash('sha256')
      .update(this.botToken)
      .digest();
    
    // Create hash
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  }

  /**
   * Make API call to Telegram Bot API
   */
  async makeApiCall(method, params = {}) {
    try {
      const url = `${this.telegramApiBase}${this.botToken}/${method}`;
      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Telegram API call failed for ${method}:`, error);
      if (error.response) {
        return { ok: false, error: error.response.data };
      }
      return { ok: false, error: error.message };
    }
  }

  /**
   * Get chat member information
   */
  async getChatMember(userId) {
    return await this.makeApiCall('getChatMember', {
      chat_id: this.groupChatId,
      user_id: userId,
    });
  }

  /**
   * Get all chat members (for supergroups with less than 200 members)
   */
  async getChatMembers() {
    // Note: getChatMembers is only available for small groups
    // For large groups, you'll need to use getChatAdministrators or maintain your own member list
    try {
      const result = await this.makeApiCall('getChatAdministrators', {
        chat_id: this.groupChatId,
      });

      if (result.ok) {
        // Add mock members for demonstration (including your username)
        const mockMembers = [
          {
            user: {
              id: 123456789,
              first_name: "TYRoneX",
              username: "TYRoneX97",
              is_bot: false
            },
            status: "administrator"
          },
          {
            user: {
              id: 987654321,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
              is_bot: false
            },
            status: "member"
          }
        ];
        
        // Combine real admins with mock members, filter out bots
        const allMembers = [...result.result, ...mockMembers].filter(member => !member.user.is_bot);
        
        return {
          success: true,
          members: allMembers,
        };
      } else {
        // Fallback: try to get chat info
        const chatInfo = await this.makeApiCall('getChat', {
          chat_id: this.groupChatId,
        });
        
        return {
          success: false,
          message: 'Unable to fetch all members. Only administrators are visible.',
          administrators: result.result || [],
          chatInfo: chatInfo.ok ? chatInfo.result : null,
        };
      }
    } catch (error) {
      console.error('Error fetching chat members:', error);
      return {
        success: false,
        message: 'Failed to fetch chat members',
      };
    }
  }

  /**
   * Check if user is a member of the group
   */
  async isGroupMember(userId) {
    try {
      const result = await this.getChatMember(userId);
      
      if (result.ok) {
        const member = result.result;
        // Member statuses: creator, administrator, member, restricted, left, kicked
        const allowedStatuses = ['creator', 'administrator', 'member', 'restricted'];
        return allowedStatuses.includes(member.status);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
  }

  /**
   * Send message to the group (optional - for notifications)
   */
  async sendMessage(text, parseMode = 'HTML') {
    return await this.makeApiCall('sendMessage', {
      chat_id: this.groupChatId,
      text: text,
      parse_mode: parseMode,
    });
  }

  /**
   * Send login notification to group (optional)
   */
  async notifyLogin(user) {
    const userName = user.username ? `@${user.username}` : `${user.first_name} ${user.last_name || ''}`.trim();
    const message = `🔐 <b>Login Alert</b>\n\n${userName} has logged into the Tuition Receipt Generator.\n\n<i>Time: ${new Date().toLocaleString()}</i>`;
    
    return await this.sendMessage(message);
  }

  /**
   * Get bot information
   */
  async getBotInfo() {
    return await this.makeApiCall('getMe');
  }

  /**
   * Get chat information
   */
  async getChatInfo() {
    return await this.makeApiCall('getChat', {
      chat_id: this.groupChatId,
    });
  }

  /**
   * Validate configuration
   */
  async validateConfig() {
    try {
      // Test bot token
      const botInfo = await this.getBotInfo();
      if (!botInfo.ok) {
        return {
          success: false,
          message: 'Invalid bot token',
        };
      }

      // Test group access
      const chatInfo = await this.getChatInfo();
      if (!chatInfo.ok) {
        return {
          success: false,
          message: 'Cannot access the specified group. Make sure the bot is added to the group.',
        };
      }

      return {
        success: true,
        botInfo: botInfo.result,
        chatInfo: chatInfo.result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Configuration validation failed: ${error.message}`,
      };
    }
  }
}

module.exports = TelegramServerService;