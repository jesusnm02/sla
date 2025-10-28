import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Sidebar from '@/components/common/Sidebar';
import AppHeader from '@/components/common/AppHeader';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long');

async function getUserNameFromToken(): Promise<string> {
  const cookieStore = cookies();
  const sessionToken = (await cookieStore).get('session_token')?.value;

  if (!sessionToken) {
    return 'Guest';
  }

  try {
    const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
    return (payload.name as string) || 'User';
  } catch (error) {
    console.error('Failed to verify token:', error);
    return 'Guest';
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userName = await getUserNameFromToken();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader userName={userName} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
