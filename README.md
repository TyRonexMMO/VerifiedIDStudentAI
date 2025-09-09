# KIIT Tuition Receipt Generator Premium

A premium version of the tuition receipt generator with Telegram bot authentication, AI-powered features, and advanced functionality.

## 🔐 Authentication Methods

This application now supports two authentication methods:

### 1. Telegram Bot Authentication (Recommended)
- Login using your Telegram account
- Group-based access control
- No passwords to remember
- Secure and convenient

### 2. Legacy Username/Password
- Traditional login method
- Available as fallback option

## 🚀 Quick Start

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install server dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required for AI features
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Required for Telegram authentication
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_GROUP_CHAT_ID=your_group_chat_id_here
   
   # Optional
   TELEGRAM_NOTIFY_LOGIN=false
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## 📱 Telegram Bot Setup

For detailed Telegram bot setup instructions, see [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)

### Quick Setup Summary:

1. **Create a bot with @BotFather on Telegram**
2. **Get your bot token**
3. **Create or use an existing Telegram group**
4. **Add your bot to the group as admin**
5. **Get your group chat ID**
6. **Configure environment variables**
7. **Test the configuration**

## 🎯 Features

### Authentication Features
- ✅ Telegram bot authentication
- ✅ Group-based access control
- ✅ Legacy username/password fallback
- ✅ Admin panel for member management
- ✅ Login notifications (optional)
- ✅ Session management

### Receipt Generation
- ✅ AI-powered signature generation
- ✅ Bulk receipt creation
- ✅ Indian name generation
- ✅ Auto-save settings
- ✅ Professional PDF export
- ✅ Customizable templates

### Administration
- ✅ View group members
- ✅ Monitor authentication status
- ✅ Configuration validation
- ✅ Real-time member management

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Yes (for Telegram auth) |
| `TELEGRAM_GROUP_CHAT_ID` | Your Telegram group chat ID | Yes (for Telegram auth) |
| `TELEGRAM_NOTIFY_LOGIN` | Send login notifications | No |
| `PORT` | Server port number | No (default: 3000) |

### Optional Features

- **Login Notifications**: Set `TELEGRAM_NOTIFY_LOGIN=true` to receive notifications when users log in
- **Rate Limiting**: Built-in rate limiting for API protection
- **Auto-save**: Settings are automatically saved to localStorage

## 🛡️ Security Features

- **Environment Variables**: Sensitive data stored in environment variables
- **Group Verification**: Only authorized Telegram group members can access
- **Rate Limiting**: API endpoint protection
- **Hash Validation**: Telegram authentication data is validated
- **Session Management**: Secure session handling

## 📡 API Endpoints

### Telegram Authentication
- `GET /api/telegram/config` - Get bot configuration
- `POST /api/telegram/verify-member` - Verify group membership
- `GET /api/telegram/group-members` - Get group members list
- `POST /api/telegram/authenticate` - Authenticate user
- `GET /api/telegram/validate-config` - Validate bot configuration

### Gemini AI Proxy
- `/api-proxy/**` - Proxy requests to Gemini AI API

## 🎨 User Interface

### Login Page
- Telegram login widget integration
- Fallback to username/password
- Loading states and error handling
- Responsive design

### Admin Panel
- Configuration status monitoring
- Group member management
- Real-time member list
- Status indicators

### User Info
- Current user display
- Quick access to admin panel
- One-click logout
- Profile photo integration

## 🚀 Deployment

### Local Development
```bash
# Start frontend (port 5173)
npm run dev

# Start backend (port 3000)
cd server
npm start
```

### Production Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Copy build files to server:**
   ```bash
   cp -r dist/* server/dist/
   ```

3. **Set production environment variables**

4. **Start the production server:**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

### Google Cloud Run

For Google Cloud Run deployment with secrets:

```bash
gcloud run deploy my-app --source=. --update-secrets=GEMINI_API_KEY=gemini_api_key:latest,TELEGRAM_BOT_TOKEN=telegram_bot_token:latest,TELEGRAM_GROUP_CHAT_ID=telegram_group_chat_id:latest
```

## 🔍 Troubleshooting

### Common Issues

1. **Telegram authentication not working**
   - Check bot token and group chat ID
   - Verify bot is admin in the group
   - Ensure users are group members

2. **"Configuration Error" in admin panel**
   - Validate environment variables
   - Check bot permissions
   - Verify group accessibility

3. **Cannot see group members**
   - Large groups only show administrators
   - Bot needs appropriate permissions
   - Check group privacy settings

### Debug URLs

Test your configuration with these URLs:

```
GET /api/telegram/validate-config
GET /api/telegram/config
GET /api/telegram/group-members
```

## 📞 Support

For support and questions:
- Telegram: [@TYRoneX97](https://t.me/TYRoneX97)
- Check the [Telegram Setup Guide](./TELEGRAM_SETUP.md)
- Review server logs for error messages

## 📄 License

© 2025 Kalinga Institute of Industrial Technology | Tuition Receipt Generator Premium

---

**Note**: This application requires proper configuration of both Gemini AI API and Telegram Bot API for full functionality. See setup guides for detailed instructions.
