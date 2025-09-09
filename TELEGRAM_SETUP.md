# Telegram Bot Authentication Setup Guide

This guide will help you set up Telegram bot authentication for your tuition receipt generator application.

## Prerequisites

1. A Telegram account
2. Access to create a Telegram bot via BotFather
3. A Telegram group where you want to control access

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a conversation with BotFather by sending `/start`
3. Create a new bot by sending `/newbot`
4. Follow the instructions to choose a name and username for your bot
5. BotFather will provide you with a bot token. **Save this token securely!**

Example bot token format: `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ`

## Step 2: Create or Use an Existing Group

1. Create a new Telegram group or use an existing one
2. Add your bot to the group as an administrator
3. Give the bot the following permissions:
   - Read messages
   - Send messages (optional, for notifications)
   - Manage group members

## Step 3: Get Your Group Chat ID

### Method 1: Using a Bot
1. Add the bot `@userinfobot` to your group temporarily
2. Send any message to the group
3. The bot will reply with group information including the Chat ID
4. Remove the bot from the group after getting the ID

### Method 2: Using Telegram Web
1. Open your group in Telegram Web (web.telegram.org)
2. Look at the URL: `https://web.telegram.org/a/#-1001234567890`
3. The number after `#` is your chat ID (including the negative sign)

### Method 3: Using Bot API
1. Add your bot to the group
2. Send a message to the group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for your group in the response and find the chat ID

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to `.env` in the server directory
2. Fill in the required values:

```env
# Your bot token from BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ

# Your group chat ID (include the negative sign if present)
TELEGRAM_GROUP_CHAT_ID=-1001234567890

# Optional: Enable login notifications
TELEGRAM_NOTIFY_LOGIN=true
```

## Step 5: Test the Configuration

1. Start your server: `npm run dev` or `npm start`
2. Visit `http://localhost:3000/api/telegram/validate-config` to test your configuration
3. You should see a success response if everything is configured correctly

## Step 6: Add Group Members

Users who want to access the application must:
1. Join your Telegram group
2. Use the Telegram login button on the web application
3. Authenticate through Telegram

## Security Notes

1. **Keep your bot token secret** - Never commit it to version control
2. **Use environment variables** - Store sensitive data in `.env` files
3. **Regular monitoring** - Check who has access to your group regularly
4. **Bot permissions** - Only give the bot minimum required permissions

## Troubleshooting

### Common Issues

1. **"Bot not found" error**
   - Check that your bot token is correct
   - Ensure there are no extra spaces in the token

2. **"Forbidden: bot is not a member of the supergroup chat"**
   - Add your bot to the group
   - Make sure the bot has admin privileges

3. **"Chat not found"**
   - Verify your group chat ID is correct
   - Ensure the chat ID includes the negative sign if it's a supergroup

4. **Users can't authenticate**
   - Verify users are members of the specified group
   - Check that the bot can see group members
   - Ensure the group settings allow bots

### Testing Commands

Test your bot setup with these URLs (replace with your actual bot token):

1. Test bot info: `https://api.telegram.org/bot<TOKEN>/getMe`
2. Test chat info: `https://api.telegram.org/bot<TOKEN>/getChat?chat_id=<CHAT_ID>`
3. Test member check: `https://api.telegram.org/bot<TOKEN>/getChatMember?chat_id=<CHAT_ID>&user_id=<USER_ID>`

## Group Types and Limitations

- **Small groups** (< 200 members): Full member list access
- **Large groups/supergroups**: Only administrators are visible via API
- **Channels**: Different permissions and access patterns

For large groups, consider using the bot to track joins/leaves or maintain your own member database.

## Optional Features

### Login Notifications
Set `TELEGRAM_NOTIFY_LOGIN=true` to receive notifications in your group when someone logs in.

### Custom Welcome Messages
You can modify the `TelegramServerService` to send custom welcome messages to new users.

### Rate Limiting
The server includes rate limiting for API calls to prevent abuse.

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Test your bot token and group ID manually
4. Ensure your group settings allow the bot to function

Contact @TYRoneX97 on Telegram for additional support.