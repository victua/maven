# Firebase Authentication Setup Instructions

## Current Issue
The application is showing the error: `FirebaseError: Firebase: Error (auth/configuration-not-found)` when trying to create user accounts.

## Root Cause
Email/Password authentication is not enabled in the Firebase Console for the project.

## Solution Steps

### 1. Enable Email/Password Authentication

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `gomavenke`
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Click on the "Sign-in method" tab
4. **Enable Email/Password**:
   - Find "Email/Password" in the list of providers
   - Click on it
   - Toggle "Enable" to ON
   - Click "Save"

### 2. Verify Firestore Rules (if needed)

Make sure Firestore rules allow read/write access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read/write collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Test the Setup

After enabling Email/Password authentication:

1. **Go to the application**: http://localhost:5178/
2. **Navigate to Setup page**: Click "Get Started" → "Setup"
3. **Test Firebase Connection**: Click "Test Firebase Connection"
4. **Create Sample Users**: Click "Create Sample Users"

### 4. Sample User Accounts

The setup will create these test accounts:
- **admin@maven.co.ke** (Administrator)
- **agency@maven.co.ke** (Agency Partner)
- **talent@maven.co.ke** (Talent/Candidate)
- **team@maven.co.ke** (Maven Team)

All accounts use password: `test1234`

## Additional Configuration (Optional)

### Enable other sign-in methods if needed:
- Google Sign-in
- Anonymous authentication
- Custom authentication

### Configure Email Templates:
- Password reset emails
- Email verification
- Welcome emails

## Troubleshooting

If you still encounter issues:

1. **Check Browser Console** for detailed error messages
2. **Verify Project ID** matches in `src/lib/firebase.ts`
3. **Check Firestore Rules** allow the required operations
4. **Ensure Network Access** to Firebase services

## Next Steps

Once authentication is enabled:
1. Complete the setup process
2. Test all user roles and functionality
3. Create additional sample data if needed
4. Deploy to production when ready

---

**Important**: This is a development setup. For production, ensure proper security rules and user management processes are in place.