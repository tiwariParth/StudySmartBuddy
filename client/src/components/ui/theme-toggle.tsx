"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
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
        <div className="w-5 h-5 bg-slate-200 rounded-full" />
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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="w-9 h-9 rounded-full relative"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {theme === "light" ? (
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 transition-all" />
        ) : theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-slate-300 transition-all" />
        ) : (
          <Laptop className="h-[1.2rem] w-[1.2rem] transition-all" />
        )}
      </motion.div>
    </Button>
  );
}