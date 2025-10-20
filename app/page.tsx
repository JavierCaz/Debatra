import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Link from 'next/link';
import { UserNav } from '@/components/auth/user-nav';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Debate Platform
              </h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Evidence-Based Debates
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Engage in structured, asynchronous debates with mandatory references
            and clear win conditions. Quality over speed.
          </p>

          <div className="flex justify-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium text-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/debates"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 font-medium text-lg"
                >
                  Browse Debates
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium text-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 font-medium text-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Evidence-Based</h3>
            <p className="text-gray-600">
              All arguments must be backed by credible references and sources.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold mb-2">Turn-Based</h3>
            <p className="text-gray-600">
              Asynchronous format allows for thoughtful, well-researched responses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Clear Outcomes</h3>
            <p className="text-gray-600">
              Defined win conditions and community voting determine winners.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}