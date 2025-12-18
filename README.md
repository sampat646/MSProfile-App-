This is a complete `README.md` you can copy-paste into your repo.

***

# MSProfile-App – React Native Microsoft Authentication

A React Native application that implements Microsoft/Azure AD authentication and displays the current user's profile information using Microsoft Graph API.

## Overview

This app allows users to:

- Login with their Microsoft 365/Azure AD account using OAuth 2.0  
- View their profile information (name, job title, email, phone, location)  
- Display their profile photo  
- Maintain persistent login sessions with token refresh  
- Logout securely and clear tokens  

## Technology Stack

- **React Native** – Cross-platform mobile framework  
- **TypeScript** – Type-safe development  
- **react-native-app-auth** – OAuth 2.0 authentication library  
- **Microsoft Graph API** – User profile data access  
- **AsyncStorage** – Secure token storage  
- **Azure Active Directory** – Identity provider  

## Prerequisites

Before starting, ensure you have:

- Node.js (v14 or higher)  
- React Native CLI or Expo CLI  
- Android Studio (for Android) or Xcode (for iOS)  
- Microsoft Azure account with access to Azure AD  
- Code editor (VS Code recommended)  

***

## Azure AD App Registration

### Step 1: Register Your Application

1. Go to the **Azure Portal**: https://portal.azure.com  
2. Navigate to: **Azure Active Directory** → **App registrations**  
3. Click **New registration**  
4. Fill in the details:  
   - **Name**: `MSProfile-App`  
   - **Supported account types**:  
     - Select **“Accounts in any organizational directory and personal Microsoft accounts”**  
5. Click **Register**  
6. Copy and save:  
   - **Application (client) ID**  
   - **Directory (tenant) ID**  

### Step 2: Configure Authentication

1. In your app registration, go to the **Authentication** tab  
2. Click **Add a platform** → **Mobile and desktop applications**  
3. Add the redirect URI:

   ```text
   msauth.yourpackagename://auth
   ```

   Example:

   ```text
   msauth.com.msprofileapp://auth
   ```

4. (Optional) Enable **Public client flows** for mobile use cases  

### Step 3: API Permissions

1. Go to the **API permissions** tab  
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**  
3. Add the following delegated permissions:

   - `User.Read`  
   - `openid`  
   - `profile`  
   - `email`  
   - `offline_access`  

4. Click **Add permissions**  
5. Click **Grant admin consent** (if required by your tenant)  

***

## Project Setup

### 1. Create React Native Project

```bash
# Using React Native CLI
npx react-native init MSProfileApp --template react-native-template-typescript

# OR using Expo
npx create-expo-app MSProfileApp --template
```

### 2. Install Dependencies

```bash
npm install react-native-app-auth @react-native-async-storage/async-storage axios

# For iOS
cd ios && pod install && cd ..
```

***

## Platform-Specific Configuration

### Android Setup

Edit `android/app/build.gradle` and add `manifestPlaceholders` inside `defaultConfig`:

```gradle
android {
    defaultConfig {
        manifestPlaceholders = [
            appAuthRedirectScheme: 'msauth.yourpackagename'
        ]
    }
}
```

Edit `android/build.gradle` to ensure the maven repo is available if required:

```gradle
allprojects {
    repositories {
        maven {
            url 'https://pkgs.dev.azure.com/MicrosoftDeviceSDK/DuoSDK-Public/_packaging/Duo-SDK-Feed/maven/v1'
        }
    }
}
```

### iOS Setup

In `ios/MSProfileApp/Info.plist`, add:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>msauth.yourpackagename</string>
    </array>
  </dict>
</array>
```

Replace `msauth.yourpackagename` with your actual redirect scheme.

***

## Environment Configuration

Create `src/config/env.config.ts`:

```typescript
export const env = {
  MICROSOFT_CLIENT_ID: 'your-client-id-here',
  MICROSOFT_TENANT_ID: 'your-tenant-id-here', // or 'common' for multi-tenant
  MICROSOFT_REDIRECT_URI: 'msauth.yourpackagename://auth',
};
```

> Never commit real IDs and secrets to Git. Use `.env` and something like `react-native-config` in production.

***

## Project Structure

```text
MSProfileApp/
├── src/
│   ├── config/
│   │   ├── env.config.ts          # Azure AD credentials
│   │   └── auth.config.ts         # Auth configuration (optional helper)
│   ├── services/
│   │   ├── auth.service.ts        # Authentication logic
│   │   ├── user.service.ts        # User profile API calls
│   │   └── graph.service.ts       # Microsoft Graph helper (optional)
│   ├── screens/
│   │   └── LoginScreen.tsx        # Main login/profile screen
│   ├── types/
│   │   ├── auth.types.ts          # Auth TypeScript interfaces
│   │   └── user.types.ts          # User TypeScript interfaces
│   └── utils/
│       ├── storage.util.ts        # Storage helpers
│       └── logger.util.ts         # Logging utilities
├── android/                       # Android native code
├── ios/                           # iOS native code
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

***

## Key Implementation Files

### Authentication Service – `auth.service.ts`

Responsible for the OAuth 2.0 flow with Azure AD using `react-native-app-auth`.

**Main responsibilities:**

- `signIn()`  
  - Starts the Microsoft login flow  
  - Receives `accessToken`, `refreshToken`, etc.  
  - Stores tokens in `AsyncStorage`  

- `signOut(accessToken)`  
  - Clears stored tokens from `AsyncStorage`  
  - Optionally revokes tokens via the revocation endpoint  

- `getStoredToken()`  
  - Returns the stored `accessToken` from `AsyncStorage`  

- `getTokenSilently()`  
  - Tries to use existing `accessToken`  
  - If expired and a `refreshToken` is available, refreshes it  
  - Returns a valid `accessToken` or `null`  

**OAuth configuration shape:**

```typescript
const config = {
  clientId: env.MICROSOFT_CLIENT_ID,
  redirectUrl: env.MICROSOFT_REDIRECT_URI,
  scopes: ['openid', 'profile', 'email', 'User.Read', 'offline_access'],
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
  },
};
```

***

### User Service – `user.service.ts`

Handles fetching the user’s profile and photo from Microsoft Graph.

**Functions:**

- `getUserProfile(accessToken)`  
  - `GET https://graph.microsoft.com/v1.0/me`  
  - Returns user details like:
    - `id`  
    - `displayName`  
    - `mail`  
    - `userPrincipalName`  
    - `jobTitle`  
    - `mobilePhone`  
    - `officeLocation`  
    - `givenName` / `surname`  

- `getUserPhoto(accessToken)`  
  - `GET https://graph.microsoft.com/v1.0/me/photo/$value`  
  - Converts the binary response to a base64 data URL  
  - Returns a string usable in `<Image source={{ uri: photoUrl }} />`  

***

### Login Screen – `LoginScreen.tsx`

Main UI component which:

- On mount:
  - Calls `getTokenSilently()` to check existing session  
  - If token exists, fetches user profile and photo  

- On **Login**:
  - Calls `signIn()`  
  - Stores `accessToken` in local state  
  - Fetches profile via `getUserProfile()`  
  - Fetches photo via `getUserPhoto()`  

- On **Logout**:
  - Calls `signOut(accessToken)` (best-effort)  
  - Clears local user state and tokens  

- UI:

  - Shows loader during operations  
  - If not logged in:
    - Welcome title  
    - “Sign in with Microsoft” button  
    - Error message if login fails  
  - If logged in:
    - Profile photo  
    - Greeting: “Hi, {givenName || displayName}!”  
    - Rows for job title, mobile, office location, etc.  

***

## Running the Application

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing

```bash
npm test
```

***

## Microsoft Graph API Endpoints Used

| Endpoint                     | Purpose             | Scope required |
| ---------------------------- | ------------------- | -------------- |
| `GET /v1.0/me`              | Get user profile    | `User.Read`    |
| `GET /v1.0/me/photo/$value` | Get profile photo   | `User.Read`    |

***

## TypeScript Interfaces

### `AuthState` – `auth.types.ts`

```typescript
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### `User` – `user.types.ts`

```typescript
export interface User {
  id: string;
  displayName: string;
  mail: string;
  jobTitle: string;
}
```

(You can extend this to match the full `UserProfile` shape used in `user.service.ts`.)

***

## Features Implemented

- ✅ Microsoft OAuth 2.0 authentication  
- ✅ Token storage and management with AsyncStorage  
- ✅ Automatic token refresh when possible  
- ✅ Persistent login sessions across app restarts  
- ✅ Display of user profile details  
- ✅ Profile photo rendering  
- ✅ Secure logout (local and optional remote revocation)  
- ✅ Basic error handling for auth and API calls  
- ✅ TypeScript types for auth and user data  

***

## Troubleshooting

### Issue: “Unable to open URL”

- Confirm the redirect URI in Azure AD matches the one used in the app  
- Check Android `manifestPlaceholders` (`appAuthRedirectScheme`)  
- Check iOS `CFBundleURLSchemes` in `Info.plist`  

### Issue: “Login failed”

- Verify **Client ID** and **Tenant ID** in `env.config.ts`  
- Confirm Graph permissions are added and admin consent is granted  
- Ensure `offline_access` is included for refresh tokens  

### Issue: “Token expired”

- Ensure `getTokenSilently()` is used before calling APIs  
- Check that refresh token is being stored and read correctly  

### Issue: “Profile photo not loading”

- User may not have a photo configured  
- Validate network connectivity  
- Confirm `User.Read` permission is granted and consented  

***

## Security Best Practices

- Store tokens only in secure storage (AsyncStorage is the minimum; use more secure options for production).  
- Never hard-code client IDs, tenant IDs, or secrets in source; use environment variables.  
- Always use `https` endpoints for API calls.  
- Request only the minimal scopes needed (e.g., `User.Read` instead of broader scopes).  
- Implement proper error handling and avoid logging sensitive token values in production.  

***

## Resources

- React Native App Auth: https://github.com/FormidableLabs/react-native-app-auth  
- Microsoft Graph Documentation: https://learn.microsoft.com/graph/overview  
- Azure AD / Entra ID Platform: https://learn.microsoft.com/entra/identity-platform/  
- React Native Docs: https://reactnative.dev/docs/getting-started  

***

You can now paste this into a `README.md` file at the root of your project.