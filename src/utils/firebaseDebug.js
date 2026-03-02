/**
 * Firebase Connection Diagnostic Tool
 * Run this in browser console to test Firebase connectivity
 */

import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export async function testFirebaseConnection() {
    console.log('🔍 Firebase Diagnostic Test Started...\n');
    
    // Test 1: Check Auth State
    console.log('Test 1: Authentication Status');
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('✅ User logged in:', {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                });
                
                // Test 2: Check Firestore Connection
                console.log('\nTest 2: Firestore Connection');
                try {
                    const testRef = collection(db, 'businesses');
                    const userDoc = query(testRef, where('__name__', '==', user.uid));
                    const snap = await getDocs(userDoc);
                    console.log('✅ Firestore is accessible');
                    
                    // Test 3: Check for user's business
                    const businessRef = collection(db, 'businesses');
                    const businessSnap = await getDocs(query(businessRef, where('__name__', '==', user.uid)));
                    
                    if (businessSnap.empty) {
                        console.log('⚠️ WARNING: No business profile found for this user');
                    } else {
                        console.log('✅ Business found:', businessSnap.docs[0].data());
                    }
                    
                    // Test 4: Check all collections for user's data
                    console.log('\nTest 3: Data Collections Check');
                    const collectionsToCheck = ['products', 'customers', 'invoices', 'payments'];
                    
                    for (const collName of collectionsToCheck) {
                        try {
                            const q = query(collection(db, collName), where('businessId', '==', user.uid));
                            const snap = await getDocs(q);
                            console.log(`- ${collName}: ${snap.size} document(s)`);
                            if (snap.size > 0) {
                                console.log(`  Sample:`, snap.docs[0].data());
                            }
                        } catch (e) {
                            console.log(`- ${collName}: ❌ Error reading -`, e.message);
                        }
                    }
                    
                    console.log('\n✅ Firestore Connection Test Complete');
                    resolve({ success: true, user });
                    
                } catch (err) {
                    console.error('❌ Firestore Error:', err.message);
                    console.error('Error Code:', err.code);
                    resolve({ success: false, error: err.message });
                }
            } else {
                console.log('❌ User NOT logged in');
                resolve({ success: false, error: 'User not authenticated' });
            }
        });
    });
}

export function showFirebaseConfig() {
    console.log('Firebase Configuration:');
    console.log({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Missing'
    });
}
