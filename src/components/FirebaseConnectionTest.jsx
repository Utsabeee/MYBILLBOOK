// FirebaseConnectionTest.jsx - Add this to test Firebase
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function FirebaseConnectionTest() {
    const [testResults, setTestResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            // Check auth
            const user = auth.currentUser;
            if (!user) {
                setTestResults({ error: '❌ Not logged in' });
                setLoading(false);
                return;
            }

            const results = {
                auth: `✅ Logged in as ${user.email}`,
                uid: user.uid,
                collections: {}
            };

            // Check each collection
            const collections = ['products', 'customers', 'invoices', 'payments', 'businesses'];
            
            for (const collName of collections) {
                try {
                    let snap;
                    if (collName === 'businesses') {
                        // businesses doc is keyed by UID, not businessId field
                        snap = await getDocs(collection(db, collName));
                        const userBusiness = snap.docs.find(d => d.id === user.uid);
                        results.collections[collName] = userBusiness 
                            ? `✅ ${userBusiness.id.slice(0, 10)}...` 
                            : '❌ No data';
                    } else {
                        snap = await getDocs(query(collection(db, collName), where('businessId', '==', user.uid)));
                        results.collections[collName] = `✅ ${snap.size} records` || '❌ No data';
                    }
                } catch (e) {
                    results.collections[collName] = `❌ ${e.message.slice(0, 30)}...`;
                }
            }

            setTestResults(results);
        } catch (error) {
            setTestResults({ error: `Error: ${error.message}` });
        }
        setLoading(false);
    };

    return (
        <div style={{
            padding: '20px',
            background: '#f0f0f0',
            borderRadius: '8px',
            margin: '20px 0',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h3>🔧 Firebase Connection Test</h3>
            <button 
                onClick={runTest}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    background: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                }}
            >
                {loading ? 'Testing...' : 'Test Firebase'}
            </button>
            
            {testResults && (
                <pre style={{ marginTop: '15px', background: 'white', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(testResults, null, 2)}
                </pre>
            )}
        </div>
    );
}
