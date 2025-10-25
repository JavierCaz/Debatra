"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

export function UserNav() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
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
      <button
        type="button"
        onClick={() => router.push(`/profile/${user?.id}`)}
        className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer"
      >
        {user?.name || user?.email}
      </button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/signout" })}
        className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
