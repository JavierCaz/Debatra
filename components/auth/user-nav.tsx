'use client';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function UserNav() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/signin"
          className="text-gray-700 hover:text-gray-900 font-medium"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        {user?.name || user?.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/auth/signout' })}
        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
      >
        Sign out
      </button>
    </div>
  );
}