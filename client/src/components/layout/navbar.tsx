"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Menu, X, Upload, LayoutDashboard, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";

const routes = [
  { name: "Home", path: "/", icon: <Book className="h-4 w-4 mr-2" /> },
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
  { name: "Upload", path: "/upload", icon: <Upload className="h-4 w-4 mr-2" /> },
  { name: "Flashcards", path: "/flashcards", icon: <BookOpenText className="h-4 w-4 mr-2" /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header className={cn(
      "sticky top-0 z-40 transition-all duration-200",
      scrolled 
        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
        : "bg-white dark:bg-slate-900 border-b border-transparent"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary/10 p-2 rounded-md transition-all duration-300 group-hover:bg-primary/20">
              <Book className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden font-bold sm:inline-block text-lg"
            >
              Study<span className="text-primary">Smart</span>Buddy
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-10">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center",
                  pathname === route.path 
                    ? "text-primary font-medium bg-primary/10" 
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Upload button in navbar for quick access */}
          <div className="hidden md:block">
            <Link href="/upload">
              <Button size="sm" className="gap-2 transition-transform hover:scale-105 active:scale-95">
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex items-center justify-center rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            ) : (
              <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.nav 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="container md:hidden py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <ul className="flex flex-col gap-2">
            {routes.map((route) => (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md transition-colors",
                    pathname === route.path 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </header>
  );
}
