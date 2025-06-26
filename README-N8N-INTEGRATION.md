# N8N Backend Integration for Quiddity Chat App

This document provides comprehensive instructions for setting up and configuring the n8n backend integration for the Quiddity Chat App.

## Overview

The integration transforms the Quiddity Chat App into a full-stack real-time messaging platform using n8n workflows as the backend, while preserving all existing React component interfaces.

## Architecture

```
Frontend (React) ↔ N8N Webhooks ↔ PostgreSQL Database
                ↕
        JWT Authentication & Encryption
```

## Prerequisites

- N8N instance (self-hosted or cloud)
- PostgreSQL database
- Node.js environment variables configured

## Environment Setup

1. Copy `.env.example` to `.env` and configure:

```bash
# N8N Configuration
VITE_N8N_BASE_URL=https://your-n8n-instance.com
VITE_N8N_WEBHOOK_TOKEN=your-webhook-token

# Database
N8N_DB_HOST=localhost
N8N_DB_PORT=5432
N8N_DB_NAME=quiddity_chat
N8N_DB_USER=postgres
N8N_DB_PASSWORD=your-password

# Security
VITE_JWT_SECRET=your-jwt-secret-key
VITE_JWT_REFRESH_SECRET=your-jwt-refresh-secret
VITE_MESSAGE_ENCRYPTION_KEY=your-32-char-encryption-key

# Performance
VITE_ACTIVE_CHAT_POLL_INTERVAL=5000
VITE_BACKGROUND_POLL_INTERVAL=30000
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE quiddity_chat;
```

2. Run the schema from `n8n-workflows/database-schema.sql`

3. Configure n8n PostgreSQL credentials with ID `postgres-main`

## N8N Workflow Installation

### 1. Authentication Workflow

Import `n8n-workflows/auth-workflow.json` into your n8n instance.

**Endpoints created:**
- `POST /webhook/auth/login`
- `POST /webhook/auth/register`
- `POST /webhook/auth/refresh`

### 2. Message Workflow

Import `n8n-workflows/message-workflow.json` into your n8n instance.

**Endpoints created:**
- `POST /webhook/messages/send`
- `POST /webhook/messages/poll`
- `POST /webhook/messages/typing`
- `POST /webhook/messages/read-receipt`

### 3. Contact Workflow

Create additional workflows for:
- `GET /webhook/contacts/sync`
- `GET /webhook/contacts/{id}`
- `PUT /webhook/contacts/{id}/status`

## Security Features

### JWT Authentication
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Automatic token refresh

### Message Encryption
- End-to-end encryption using AES
- Encrypted payloads in database
- Client-side decryption

### Rate Limiting
- Configurable per-endpoint limits
- Automatic retry with backoff
- User-based rate limiting

## Real-Time Features

### Message Polling
- Active chat: 5-second intervals
- Background: 30-second intervals
- Automatic optimization based on tab visibility

### Typing Indicators
- Real-time typing status
- 3-second timeout
- Debounced updates

### Read Receipts
- Automatic message status updates
- Batch read receipt processing
- Real-time status synchronization

## Component Integration

### Preserved Interfaces

All existing component props and styling are preserved:

```typescript
// MessageInput.tsx - No changes to props
interface MessageInputProps {
  onSendMessage: (content: string, type: 'text') => void;
  onSendImage: (file: File, caption?: string) => void;
  onSendDocument: (file: File, caption?: string) => void;
  disabled?: boolean;
}

// ChatView.tsx - Enhanced with n8n backend
const ChatView: React.FC<ChatViewProps> = ({ 
  contactId, 
  onBack, 
  searchQuery, 
  searchMessageId 
}) => {
  // Uses useN8nChat hook internally
  // All existing animations and UI preserved
};
```

### New Hooks

```typescript
// useN8nChat - Real-time chat functionality
const {
  messages,
  contact,
  isLoading,
  error,
  sendMessage,
  sendTypingIndicator,
  markMessagesAsRead
} = useN8nChat({ contactId });

// useN8nAuth - Authentication management
const {
  isAuthenticated,
  login,
  logout,
  refreshToken
} = useN8nAuth();
```

## Performance Optimizations

### Message Batching
- Batch message sends for performance
- Batch read receipts
- Optimized polling intervals

### Caching Strategy
- Contact information caching
- Message history caching
- Intelligent cache invalidation

### Connection Management
- Automatic reconnection
- Graceful error handling
- Background sync optimization

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation
- User-friendly error messages

### Authentication Errors
- Automatic token refresh
- Secure logout on token expiry
- Session management

### Rate Limiting
- Automatic retry after rate limit
- User feedback for rate limits
- Intelligent request queuing

## Monitoring & Debugging

### Logging
- Structured logging for all API calls
- Error tracking and reporting
- Performance metrics

### Development Tools
- Network request inspection
- Real-time message debugging
- Authentication flow testing

## Deployment Checklist

### Production Setup
- [ ] Configure production n8n instance
- [ ] Set up PostgreSQL with SSL
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Configure HTTPS for all endpoints
- [ ] Set up proper CORS policies
- [ ] Enable database encryption
- [ ] Configure webhook authentication
- [ ] Set up API rate limiting

### Performance Checklist
- [ ] Optimize polling intervals
- [ ] Configure database indexes
- [ ] Set up connection pooling
- [ ] Configure caching strategy
- [ ] Monitor memory usage
- [ ] Set up CDN for static assets

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check JWT secret configuration
   - Verify token expiry settings
   - Ensure webhook authentication

2. **Message Delivery Issues**
   - Verify database connectivity
   - Check encryption/decryption
   - Monitor polling intervals

3. **Performance Issues**
   - Optimize polling frequency
   - Check database query performance
   - Monitor network latency

### Debug Commands

```bash
# Check n8n workflow status
curl -X GET "https://your-n8n-instance.com/webhook/health"

# Test authentication
curl -X POST "https://your-n8n-instance.com/webhook/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test message sending
curl -X POST "https://your-n8n-instance.com/webhook/messages/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contactId":"123","type":"text","content":"Hello","encryptedPayload":"..."}'
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review n8n workflow logs
3. Monitor database performance
4. Check network connectivity

## License

This integration maintains the same license as the original Quiddity Chat App.