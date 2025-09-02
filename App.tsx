import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import GeneratorScreen from './components/GeneratorScreen';

interface Credentials {
  url: string;
  token: string;
}

const App: React.FC = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const handleLogin = useCallback((url: string, token: string) => {
    setCredentials({ url, token });
  }, []);

  const handleLogout = useCallback(() => {
    setCredentials(null);
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {!credentials ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <GeneratorScreen 
            githubUrl={credentials.url} 
            githubToken={credentials.token} 
            onLogout={handleLogout} 
          />
        )}
      </div>
    </main>
  );
};

export default App;