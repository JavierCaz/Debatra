import Link from "next/link";
import { UserNav } from "../auth/user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              Debatra
            </Link>
          </div>
          <UserNav />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
