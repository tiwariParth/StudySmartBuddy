"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronRight, ChevronLeft, Repeat, AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Flashcard = {
  _id: string;
  question: string;
  answer: string;
};

type Note = {
  _id: string;
  title: string;
  flashcards: Flashcard[];
};

export default function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
        const data = await api.getNoteById(id as string);
        
        if (data && data.success) {
          if (!data.note.flashcards || data.note.flashcards.length === 0) {
            throw new Error("No flashcards found for this note");
          }
          setNote(data.note);
        } else {
          throw new Error(data?.message || "Failed to fetch flashcards");
        }
      } catch (err: any) {
        console.error("Failed to fetch flashcards:", err);
        setError(err.message || "Failed to load flashcards. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchNote();
    }
  }, [id]);

  const nextCard = () => {
    if (!note || !note.flashcards) return;
    
    setDirection(1);
    if (currentCardIndex < note.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setDirection(-1);
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const resetPractice = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setDirection(0);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return <PageLoader text="Loading flashcards..." />;
  }

  if (error || !note) {
    return (
      <div className="container py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-start"
        >
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={20} />
          <span>{error || "Failed to load flashcards"}</span>
        </motion.div>
        <Button asChild className="transition-transform hover:scale-105 active:scale-95">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container max-w-3xl py-12 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="outline" asChild className="mb-4 transition-all hover:bg-primary/5">
            <Link href={`/notes/${id}`}>
              <ArrowLeft size={16} className="mr-2" /> Back to Note
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            {note.title} - Flashcards
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="text-center p-6 md:p-10 border-2 shadow-md dark:shadow-slate-800/20">
            <CardContent className="pt-6 md:pt-10 pb-6 md:pb-10">
              <div className="bg-primary/10 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Trophy size={40} className="text-primary" />
              </div>
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-4"
              >
                Practice Complete!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8 text-muted-foreground"
              >
                Congratulations! You've gone through all {note.flashcards.length} flashcards.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button onClick={resetPractice} className="gap-2 transition-transform hover:scale-105 active:scale-95">
                  <Repeat size={16} />
                  Practice Again
                </Button>
                <Button variant="outline" asChild className="transition-all hover:bg-primary/5">
                  <Link href={`/notes/${id}`}>
                    Back to Note
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentCard = note.flashcards[currentCardIndex];

  const cardVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0,
      };
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0,
      };
    },
  };

  const answerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="container max-w-3xl py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Button variant="outline" asChild className="mb-4 transition-all hover:bg-primary/5">
          <Link href={`/notes/${id}`}>
            <ArrowLeft size={16} className="mr-2" /> Back to Note
          </Link>
        </Button>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          {note.title} - Flashcards
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Card {currentCardIndex + 1} of {note.flashcards.length}
        </p>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentCardIndex}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          <Card className="mb-6 border-2 shadow-md dark:shadow-slate-800/20">
            <CardHeader className="text-center border-b">
              <CardTitle className="text-primary">Question</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-10 px-6">
              <p className="text-xl">{currentCard.question}</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-4 pb-6">
              <Button 
                onClick={toggleAnswer} 
                size="lg" 
                className="transition-transform hover:scale-105 active:scale-95"
              >
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            variants={answerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="mb-6 border-primary border-2 shadow-lg dark:shadow-primary/10 bg-primary/5 dark:bg-primary/10">
              <CardHeader className="text-center border-b border-primary/20">
                <CardTitle className="text-primary">Answer</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6 px-6">
                <p className="text-lg">{currentCard.answer}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between mt-8"
      >
        <Button 
          variant="outline"
          onClick={prevCard} 
          disabled={currentCardIndex === 0}
          className="gap-2 transition-all hover:bg-primary/5 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Button 
          onClick={nextCard} 
          className="gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 bg-muted h-2 rounded-full overflow-hidden"
      >
        <motion.div 
          className="bg-primary h-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentCardIndex + 1) / note.flashcards.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}