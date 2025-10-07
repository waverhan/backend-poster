# Login and Bonus System Documentation

## Overview

This document describes the comprehensive login and bonus system implemented for the PWA POS application. The system integrates with Poster POS for client management and uses SMS-Fly.ua for phone verification.

## Architecture

### Backend Services

#### 1. SMS-Fly Service (`server/services/smsFlyService.js`)
- **Purpose**: Handles SMS verification code sending
- **API**: SMS-Fly.ua API integration
- **Features**:
  - Send verification codes via SMS
  - Support for Viber fallback
  - Phone number validation (Ukrainian format)
  - Code generation and validation

#### 2. Poster Client Service (`server/services/posterClientService.js`)
- **Purpose**: Manages client data in Poster POS system
- **Features**:
  - Find clients by phone number
  - Create new clients
  - Update client bonus points
  - Get client details and bonus information
  - Calculate bonus points for purchases

#### 3. Auth Service (`server/services/authService.js`)
- **Purpose**: Handles authentication and user management
- **Features**:
  - SMS verification code management
  - JWT token generation and validation
  - User profile management
  - Integration with Poster client system

### Frontend Components

#### 1. Phone Login Modal (`src/components/auth/PhoneLoginModal.vue`)
- **Purpose**: User-friendly login interface
- **Features**:
  - Phone number input with Ukrainian validation
  - SMS verification code input
  - Name input for new users
  - Resend code functionality
  - Real-time validation

#### 2. Bonus Display (`src/components/auth/BonusDisplay.vue`)
- **Purpose**: Shows user bonus information
- **Features**:
  - Current bonus points display
  - Total spent amount
  - Refresh bonus information
  - Responsive design

#### 3. Auth Store (`src/stores/auth.ts`)
- **Purpose**: Centralized authentication state management
- **Features**:
  - User authentication state
  - Bonus points tracking
  - Profile management
  - Token persistence

## API Endpoints

### Authentication Routes (`server/routes/auth.js`)

#### POST `/api/auth/send-code`
Send SMS verification code to phone number.

**Request:**
```json
{
  "phone": "0501234567"
}
```

**Response:**
```json
{
  "success": true,
  "phone": "380501234567",
  "expiresIn": 300
}
```

#### POST `/api/auth/verify-code`
Verify SMS code and login/register user.

**Request:**
```json
{
  "phone": "0501234567",
  "code": "1234",
  "name": "John Doe" // Optional for new users
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "phone": "380501234567",
    "name": "John Doe",
    "bonusPoints": 150,
    "totalPaidSum": 2500
  },
  "token": "jwt_token",
  "isNewUser": false
}
```

#### GET `/api/auth/profile`
Get user profile with current bonus information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "phone": "380501234567",
    "name": "John Doe",
    "email": "john@example.com",
    "bonusPoints": 150,
    "totalPaidSum": 2500
  }
}
```

#### GET `/api/auth/bonus`
Get current bonus information.

**Response:**
```json
{
  "success": true,
  "bonusPoints": 150,
  "totalPaidSum": 2500,
  "clientName": "John Doe",
  "phone": "380501234567"
}
```

## Integration Points

### 1. Poster POS Integration

**Client Creation:**
- New users are automatically created in Poster POS
- Phone number is used as unique identifier
- Initial bonus points set to 0

**Bonus Management:**
- Bonus points are stored and managed in Poster POS
- Real-time synchronization with PWA
- Bonus earning and spending tracked

### 2. SMS-Fly Integration

**Configuration:**
- API Key: `y4gofJyEnJ7NP9znmkN1ACk5XwROzlma`
- Sender Name: `OpilliaShop`
- Message Format: `Kod podtverzhdenija OPILLIA: XXXX`

**Features:**
- SMS delivery with 5-minute TTL
- Viber fallback option
- Ukrainian phone number support

### 3. Checkout Integration

**Bonus Usage:**
- Users can apply bonus points during checkout
- 1 bonus point = 1 UAH discount
- Maximum usage limited to available points or order total
- Bonus deduction processed after successful order

**Bonus Earning:**
- 1% of purchase amount earned as bonus points
- Automatic calculation and addition to user account
- Integration with Poster POS for tracking

## Database Schema

### User Model
```sql
model User {
  id                String   @id @default(cuid())
  phone             String   @unique
  name              String
  email             String?
  role              String   @default("user")
  poster_client_id  String?  // Link to Poster POS client
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}
```

## Security Features

### 1. SMS Verification
- 4-digit verification codes
- 5-minute expiration
- Maximum 3 attempts per code
- Rate limiting for code requests

### 2. JWT Authentication
- 30-day token expiration
- Secure token storage
- Automatic token refresh
- Role-based access control

### 3. Phone Number Validation
- Ukrainian phone number format validation
- International format conversion
- Duplicate prevention

## Configuration

### Environment Variables

```env
# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Poster POS API
POSTER_API_TOKEN="218047:05891220e474bad7f26b6eaa0be3f344"

# SMS-Fly API
SMS_FLY_API_KEY="y4gofJyEnJ7NP9znmkN1ACk5XwROzlma"
```

### Frontend Configuration

```typescript
// Backend API URL
VITE_BACKEND_URL="https://backend-api-production-b3a0.up.railway.app"
```

## Usage Examples

### 1. User Login Flow
1. User enters phone number
2. SMS verification code sent
3. User enters code
4. System verifies code
5. User authenticated and redirected

### 2. Bonus Usage Flow
1. Authenticated user proceeds to checkout
2. System displays available bonus points
3. User selects bonus amount to use
4. Discount applied to order total
5. Bonus points deducted after successful order

### 3. New User Registration
1. User enters phone number (not in system)
2. SMS verification code sent
3. User enters code and name
4. New user created in PWA and Poster POS
5. User authenticated with 0 bonus points

## Error Handling

### Common Error Scenarios
- Invalid phone number format
- SMS delivery failure
- Invalid verification code
- Expired verification code
- Network connectivity issues
- Poster POS API errors

### Error Messages
- User-friendly Ukrainian error messages
- Detailed logging for debugging
- Graceful fallback handling

## Testing

### Test Scenarios
1. Phone number validation
2. SMS code verification
3. User registration flow
4. Bonus point calculation
5. Checkout integration
6. Error handling

### Test Data
- Valid Ukrainian phone numbers
- Invalid phone number formats
- Various bonus point scenarios
- Network failure simulations

## Deployment

### Backend Deployment (Railway)
1. Deploy authentication services
2. Configure environment variables
3. Run database migrations
4. Test API endpoints

### Frontend Deployment (Netlify)
1. Build with authentication components
2. Configure backend API URL
3. Test login flow
4. Verify bonus functionality

## Monitoring and Analytics

### Key Metrics
- User registration rate
- SMS delivery success rate
- Login success rate
- Bonus usage patterns
- Error rates

### Logging
- Authentication attempts
- SMS sending status
- Bonus transactions
- Error occurrences
- Performance metrics

## Future Enhancements

### Planned Features
1. Email verification option
2. Social media login integration
3. Advanced bonus rules
4. Loyalty program tiers
5. Push notifications
6. Bonus history tracking
7. Referral bonus system

### Technical Improvements
1. Redis for session management
2. Advanced rate limiting
3. Fraud detection
4. A/B testing framework
5. Performance optimization
6. Enhanced security measures
