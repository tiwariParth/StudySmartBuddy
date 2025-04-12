"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Menu, X, Upload, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { name: "Home", path: "/", icon: <Book className="h-4 w-4 mr-2" /> },
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
  { name: "Upload", path: "/upload", icon: <Upload className="h-4 w-4 mr-2" /> },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background sticky top-0 z-40 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-md">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden font-bold sm:inline-block text-lg">
              Study<span className="text-primary">Smart</span>Buddy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-10">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm transition-colors hover:bg-muted flex items-center",
                  pathname === route.path 
                    ? "text-primary font-medium bg-primary/10" 
                    : "text-foreground/70"
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Upload button in navbar for quick access */}
        <div className="hidden md:block">
          <Link href="/upload">
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
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
          <ul className="flex flex-col gap-2">
            {routes.map((route) => (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md",
                    pathname === route.path 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-foreground/70 hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {route.icon}
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
