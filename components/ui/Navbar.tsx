"use client";

import { BookOpen, LayoutDashboard, Menu, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { UserNav } from "../auth/user-nav";
import { Skeleton } from "./skeleton";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <nav className="border-b bg-background sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Skeleton className="h-8 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between h-16 items-center">
            {/* Left side - Logo */}
            <div className="flex items-center min-w-0 flex-1">
              <Link
                href="/"
                className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors truncate"
              >
                Debatra
              </Link>
              {/* Desktop Menu - Only show for authenticated users */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-6 mx-8 flex-shrink-0">
                  <Link
                    href="/debates"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Debates
                  </Link>
                  <Link
                    href="/topics"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Topics
                  </Link>
                </div>
              )}
              {/* Mobile Menu - Only show for authenticated users */}
              {isAuthenticated && (
                <div className="flex md:hidden mx-8">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[280px] sm:w-[320px]"
                    >
                      <SheetHeader className="text-left pb-6 border-b">
                        <SheetTitle className="text-xl font-bold">
                          Menu
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                          Navigate through the app
                        </p>
                      </SheetHeader>

                      <nav className="flex flex-col gap-1 py-6">
                        <Link
                          href="/debates"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <span>Debates</span>
                        </Link>

                        <Link
                          href="/topics"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span>Topics</span>
                        </Link>

                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                          </div>
                          <span>Dashboard</span>
                        </Link>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <UserNav />
              </div>

              {/* Mobile Actions */}
              <div className="flex md:hidden items-center gap-1">
                <ThemeToggle />
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
