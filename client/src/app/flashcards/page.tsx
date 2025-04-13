"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Book, AlertCircle, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FlashcardGroup = {
  noteId: string;
  noteTitle: string;
  count: number;
  flashcards: Array<{
    _id: string;
    question: string;
    answer: string;
  }>;
  createdAt: string;
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

export default function FlashcardsPage() {
  const [flashcardGroups, setFlashcardGroups] = useState<FlashcardGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default user ID for now, in a real app you would get this from auth
  const userId = "test-user-123";

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true);
        // Use the API to get all flashcards for the user
        const response = await api.getAllUserFlashcards(userId);
        
        if (response && response.success) {
          setFlashcardGroups(response.flashcardGroups || []);
        } else {
          throw new Error(response?.message || "Failed to fetch flashcards");
        }
      } catch (err: any) {
        console.error("Failed to fetch flashcards:", err);
        setError("Failed to load your flashcards. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcards();
  }, [userId]);

  if (loading) {
    return <PageLoader text="Loading your flashcards..." />;
  }

  return (
    <div className="container py-8 max-w-7xl">
      {/* Animated gradient background */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-700/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-60 left-0 w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-700/10 rounded-full blur-3xl -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          Your Flashcards
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and practice with all your flashcards
        </p>
      </motion.div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-start mb-6" 
          role="alert"
        >
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {!loading && flashcardGroups.length === 0 && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center py-12 px-4 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700"
          >
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-primary/10 w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4"
            >
              <BookOpen size={40} className="text-primary" />
            </motion.div>
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-medium mb-2"
            >
              No flashcards yet
            </motion.h3>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-muted-foreground mb-6 max-w-md mx-auto"
            >
              Upload a PDF and create notes to generate flashcards. Flashcards help reinforce your learning.
            </motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/upload">
                <Button className="gap-2 transition-transform hover:scale-105 active:scale-95">
                  Upload your first PDF
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {flashcardGroups.length > 0 && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {flashcardGroups.map((group) => (
            <motion.div 
              key={group.noteId} 
              variants={item}
              className="flex flex-col"
            >
              <Card className="h-full border-2 hover:border-primary/20 group transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {group.noteTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Book size={20} />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {group.count} flashcard{group.count !== 1 ? 's' : ''}
                  </p>
                  
                  {/* Preview of first 2 flashcards */}
                  <div className="space-y-2 mb-4">
                    {group.flashcards.slice(0, 2).map((flashcard, index) => (
                      <div key={index} className="text-sm p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                        <p className="font-medium text-foreground/80 mb-1">
                          Q: {flashcard.question.length > 60 ? 
                            `${flashcard.question.substring(0, 60)}...` : 
                            flashcard.question}
                        </p>
                      </div>
                    ))}
                    {group.count > 2 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        +{group.count - 2} more flashcards
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    asChild 
                    className="w-full gap-2 group-hover:bg-primary transition-all duration-200"
                  >
                    <Link href={`/flashcards/${group.noteId}`}>
                      Practice <ArrowRight size={16} />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}