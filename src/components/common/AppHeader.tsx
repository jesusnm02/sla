'use client';

import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  userName: string;
}

const AppHeader = ({ userName }: AppHeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.push('/login');
    } else {
      // Handle logout error if needed
      console.error('Logout failed');
    }
  };

  return (
    <header className="bg-red-600 text-white p-4 flex justify-end items-center">
      <div className="flex items-center">
        <span>Bienvenido, {userName}</span>
        <button
          onClick={handleLogout}
          className="ml-4 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
