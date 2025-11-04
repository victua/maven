import { useState } from 'react';
import { Shield, Users, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { createSampleUsers } from '../lib/setupUsers';
import { testFirebaseConnection } from '../lib/testFirebase';

interface SetupPageProps {
  onNavigate: (page: string) => void;
}

export function SetupPage({ onNavigate }: SetupPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setError('');

    try {
      const connected = await testFirebaseConnection();
      if (connected) {
        setConnectionTested(true);
      } else {
        setError('Firebase connection test failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test Firebase connection');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateUsers = async () => {
    setIsCreating(true);
    setError('');

    try {
      // Test connection first if not already tested
      if (!connectionTested) {
        const connected = await testFirebaseConnection();
        if (!connected) {
          throw new Error('Firebase connection failed');
        }
        setConnectionTested(true);
      }

      const userResults = await createSampleUsers();
      setResults(userResults);
      setIsComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create sample users');
    } finally {
      setIsCreating(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-gray-300 shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 border border-gray-300 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
            <p className="text-gray-600 mb-6">
              Sample users have been created successfully. You can now sign in with any of the test accounts.
            </p>

            <div className="text-left bg-gray-50 border border-gray-300 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Creation Results:</h3>
              <div className="space-y-2 text-sm">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>
                      <strong className="capitalize">{result.role}:</strong> {result.email}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'created' ? 'bg-green-100 text-green-800' :
                      result.status === 'exists' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'created' ? 'Created' :
                       result.status === 'exists' ? 'Already exists' :
                       'Error'}
                    </span>
                  </div>
                ))}
                <div className="text-gray-600 mt-2 pt-2 border-t border-gray-200">
                  Password for all accounts: <strong>test1234</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-blue-600 text-white py-3 border border-gray-300 hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-300 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 border border-gray-300 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Maven Setup</h1>
            <p className="text-gray-600">
              Initialize your Maven platform with sample users and demo data
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 border border-gray-300 mb-6 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-300 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Sample Users</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              This will create the following test accounts:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">admin@maven.co.ke</span>
                <span className="text-gray-600">Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">agency@maven.co.ke</span>
                <span className="text-gray-600">Agency Partner</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">talent@maven.co.ke</span>
                <span className="text-gray-600">Talent/Candidate</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">team@maven.co.ke</span>
                <span className="text-gray-600">Maven Team</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              All accounts use password: <strong>test1234</strong>
            </div>
          </div>

          <div className="space-y-3">
            {!connectionTested && (
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full bg-green-600 text-white py-3 border border-gray-300 hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Wifi className="h-5 w-5" />
                <span>{isTesting ? 'Testing Connection...' : 'Test Firebase Connection'}</span>
              </button>
            )}

            {connectionTested && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 border border-gray-300 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Firebase connection successful!</span>
              </div>
            )}

            <button
              onClick={handleCreateUsers}
              disabled={isCreating || !connectionTested}
              className="w-full bg-blue-600 text-white py-3 border border-gray-300 hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Users...' : 'Create Sample Users'}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-gray-100 text-gray-900 py-3 border border-gray-300 hover:bg-gray-200 transition-colors font-semibold"
            >
              Skip Setup
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is a one-time setup. You can always create these users later if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}