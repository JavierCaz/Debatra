import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {session.user.name || session.user.email}!
          </h1>
          <p className="text-gray-600 mb-6">
            This is a protected page. Only authenticated users can see this.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Your Session Info:</h2>
            <pre className="text-sm text-blue-800 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}