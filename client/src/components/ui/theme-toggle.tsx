"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
        <span className="sr-only">Toggle theme</span>
        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </Button>
    );
  }

  // Cycle through themes: light -> dark -> system
  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Define icons for different themes
  const ThemeIcon = () => {
    if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 transition-all" />;
    } else if (theme === "dark") {
      return <Moon className="h-[1.2rem] w-[1.2rem] text-slate-300 transition-all" />;
    } else {
      return <Laptop className="h-[1.2rem] w-[1.2rem] transition-all" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="w-9 h-9 rounded-full relative hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ThemeIcon />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}