/**
 * Firebase Setup Verification Checklist
 * 
 * Run this in browser console while logged in to verify all configurations
 */

import { auth, db } from '../firebase';

export function verifyFirebaseSetup() {
    console.log('🔍 Firebase Setup Verification\n');
    
    console.log('1️⃣ Authentication Check:');
    console.log('Current user:', auth.currentUser ? `✅ ${auth.currentUser.email}` : '❌ Not logged in');
    
    console.log('\n2️⃣ Firestore Check:');
    console.log('Database object:', db ? '✅ Connected' : '❌ Not connected');
    
    console.log('\n📋 CONFIGURATION CHECKLIST:\n');
    console.log('To complete setup, verify in Firebase Console:');
    console.log('');
    console.log('✅ Authentication:');
    console.log('   - Go to Build → Authentication → Sign-in method');
    console.log('   - Enable: Google & Email/Password');
    console.log('');
    console.log('✅ Firestore Database:');
    console.log('   - Go to Build → Firestore Database');
    console.log('   - Rules should be set (NOT test mode)');
    console.log('   - Expected rules:');
    console.log('     * /businesses/{userId} → only user can read/write');
    console.log('     * /products/{id} → user based on businessId');
    console.log('     * /customers/{id} → user based on businessId');
    console.log('     * /invoices/{id} → user based on businessId');
    console.log('     * /payments/{id} → user based on businessId');
    console.log('');
    console.log('✅ Realtime Database:');
    console.log('   - Go to Build → Realtime Database');
    console.log('   - Should exist in test mode for testing');
    console.log('   - Rules tab → test mode rules');
}

// Easy copy-paste rules for Firestore
export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /businesses/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /products/{doc=**} {
      allow read, write: if request.auth.uid == resource.data.businessId
                       || request.auth.uid == request.resource.data.businessId;
    }
    match /customers/{doc=**} {
      allow read, write: if request.auth.uid == resource.data.businessId
                       || request.auth.uid == request.resource.data.businessId;
    }
    match /invoices/{doc=**} {
      allow read, write: if request.auth.uid == resource.data.businessId
                       || request.auth.uid == request.resource.data.businessId;
    }
    match /payments/{doc=**} {
      allow read, write: if request.auth.uid == resource.data.businessId
                       || request.auth.uid == request.resource.data.businessId;
    }
  }
}`;

export const REALTIME_DB_RULES = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;
