"use client";

import { Menu } from "lucide-react";
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
import { UserNav } from "../auth/user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              Debatra
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/debates"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Debates
              </Link>
              <Link
                href="/topics"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Topics
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <Link
                    href="/debates"
                    className="text-lg font-medium py-2 hover:text-foreground/80 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Debates
                  </Link>
                  <Link
                    href="/topics"
                    className="text-lg font-medium py-2 hover:text-foreground/80 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Topics
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
