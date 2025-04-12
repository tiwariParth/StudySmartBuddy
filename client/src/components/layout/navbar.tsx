"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Menu, X } from "lucide-react";

const routes = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Upload", path: "/upload" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              StudySmartBuddy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-10">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm transition-colors hover:text-foreground/80",
                  pathname === route.path ? "text-foreground font-medium" : "text-foreground/60"
                )}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="container md:hidden py-4 border-t">
          <ul className="flex flex-col gap-4">
            {routes.map((route) => (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={cn(
                    "block px-2 py-1.5 text-base",
                    pathname === route.path ? "text-foreground font-medium" : "text-foreground/60"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {route.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
