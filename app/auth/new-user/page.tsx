import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Descriptive title</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Debatra!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account has been created successfully.
          </p>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Get Started</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                ✓
              </span>
              <span>Browse ongoing debates and vote on arguments</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                ✓
              </span>
              <span>Create your own debates on topics you care about</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                ✓
              </span>
              <span>Support arguments with credible references</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                ✓
              </span>
              <span>Engage in evidence-based discussions</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/debates"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Debates
          </Link>
        </div>
      </div>
    </div>
  );
}
