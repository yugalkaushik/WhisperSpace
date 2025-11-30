# Email Authentication with OTP Verification

## Overview
WhisperSpace now supports email/password authentication alongside Google OAuth, with mandatory OTP (One-Time Password) email verification for enhanced security.

## Features

### Backend Implementation
- ✅ **OTP Model**: MongoDB schema for storing and managing OTP codes
- ✅ **Email Service**: Nodemailer integration for sending OTP emails
- ✅ **OTP Endpoints**: `/api/auth/send-otp` and `/api/auth/verify-otp`
- ✅ **User Model Update**: Added `isEmailVerified` field
- ✅ **Security Features**:
  - OTP expires after 10 minutes
  - Maximum 5 verification attempts
  - Hashed OTP storage using bcrypt
  - Auto-deletion of expired OTPs via MongoDB TTL index

### Frontend Implementation
- ✅ **Email Auth Form**: Unified login/registration form
- ✅ **OTP Verification Component**: 6-digit OTP input with:
  - Auto-focus and auto-submit
  - Paste support
  - Countdown timer
  - Resend functionality
- ✅ **Smooth Flow**: Email → OTP → Profile Setup

## Authentication Flow

### Registration Flow
1. User enters username, email, and password
2. Click "Create Account"
3. System sends 6-digit OTP to email
4. User enters OTP code
5. System verifies OTP and creates account
6. User is authenticated and redirected to profile setup

### Login Flow
1. User enters email and password
2. Click "Sign in with Email"
3. System sends 6-digit OTP to email
4. User enters OTP code
5. System verifies OTP and authenticates user
6. User is logged in and redirected to profile setup

## Email Configuration

### Development Mode
In development, OTPs are **logged to the server console** instead of being sent via email. This allows testing without SMTP configuration.

Example console output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL OTP (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Purpose: registration
OTP: 123456
Valid for: 10 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Production Mode
For production, configure SMTP settings in `.env`:

```env
# Email OTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@whisperspace.com
```

#### Gmail Setup (Recommended for Production)
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as `SMTP_PASS`

#### Other SMTP Providers
- **SendGrid**: Use their SMTP relay
- **AWS SES**: Configure with SES SMTP credentials
- **Mailgun**: Use Mailgun SMTP settings

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "registration" // or "login"
}

Response:
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

// For registration
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "registration",
  "username": "johndoe",
  "password": "securepass123"
}

// For login
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "login"
}

Response:
{
  "message": "Registration successful", // or "Login successful"
  "token": "jwt-token-here",
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "user@example.com",
    "isEmailVerified": true,
    ...
  }
}
```

## Security Features

1. **OTP Expiration**: 10-minute validity window
2. **Attempt Limiting**: Maximum 5 verification attempts per OTP
3. **Hashed Storage**: OTPs are hashed with bcrypt before database storage
4. **Auto-Cleanup**: MongoDB TTL index automatically deletes expired OTPs
5. **Purpose Isolation**: Registration and login OTPs are kept separate
6. **Email Masking**: Email addresses are partially masked in the UI

## User Experience

### OTP Input Component
- **6-digit input**: Separate fields for each digit
- **Auto-focus**: Automatically moves to next field
- **Auto-submit**: Submits when all 6 digits are entered
- **Paste support**: Can paste full OTP code
- **Timer**: Shows remaining time (10:00 countdown)
- **Resend**: Allows requesting new OTP after expiration
- **Back button**: Return to email form to change email

### Email Design
Professional HTML email template with:
- WhisperSpace branding
- Large, easy-to-read OTP code
- Expiration notice
- Security warning
- Mobile-responsive design

## Testing

### Development Testing
1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. Navigate to login page
4. Enter email and password
5. Check server console for OTP code
6. Enter OTP code in the verification screen

### Production Testing
1. Configure SMTP settings in `.env`
2. Test with real email addresses
3. Verify email delivery
4. Test OTP expiration (wait 10 minutes)
5. Test resend functionality

## Existing Google OAuth Integration
The existing Google OAuth authentication remains **completely intact**:
- Users can still sign in with Google
- Google OAuth users are automatically marked as email verified
- No changes to Google OAuth flow or functionality

## Migration Notes
- Existing users with Google accounts: No action needed
- Existing email/password users (if any): Will need to verify email on next login
- Database migration: The `isEmailVerified` field defaults to `false` for existing users

## Files Modified

### Server
- `server/src/models/OTP.ts` - New OTP model
- `server/src/models/User.ts` - Added `isEmailVerified` field
- `server/src/services/emailService.ts` - New email service
- `server/src/controllers/authController.ts` - Added OTP endpoints
- `server/src/routes/auth.ts` - Added OTP routes
- `server/src/config/passport.ts` - Set verified flag for Google users
- `server/.env.example` - Added SMTP configuration

### Client
- `client/src/components/auth/EmailAuthForm.tsx` - Updated with OTP flow
- `client/src/components/auth/EmailOTPVerification.tsx` - New OTP component
- `client/src/services/api.ts` - Added OTP API calls
- `client/src/types/index.ts` - Updated User interface
- `client/src/pages/Login.tsx` - Updated UI with email auth option

## Dependencies Added
- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types for nodemailer
