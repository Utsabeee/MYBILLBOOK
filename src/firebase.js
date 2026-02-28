import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy_api_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy_project_id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy_storage_bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy_messaging_sender_id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "dummy_app_id",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "dummy_measurement_id"
};

let app, auth, db, googleProvider, analytics;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    if (typeof window !== "undefined") {
        analytics = getAnalytics(app);
    }
} catch (e) {
    console.error("Firebase init failed. Please check your .env variables:", e);
}

export { auth, db, googleProvider, analytics };
