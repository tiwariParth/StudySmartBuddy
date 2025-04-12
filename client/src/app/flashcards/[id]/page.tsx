"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronRight, ChevronLeft, Repeat, AlertCircle } from "lucide-react";

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
    
    if (currentCardIndex < note.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const resetPractice = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCompleted(false);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={20} />
          <span>{error || "Failed to load flashcards"}</span>
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container max-w-3xl py-12">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link href={`/notes/${id}`}>
              <ArrowLeft size={16} className="mr-2" /> Back to Note
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{note.title} - Flashcards</h1>
        </div>
        
        <Card className="text-center p-10">
          <CardContent className="pt-10 pb-10">
            <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
            <p className="mb-6 text-muted-foreground">
              You've gone through all {note.flashcards.length} flashcards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetPractice} className="gap-2">
                <Repeat size={16} />
                Practice Again
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/notes/${id}`}>
                  Back to Note
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = note.flashcards[currentCardIndex];

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href={`/notes/${id}`}>
            <ArrowLeft size={16} className="mr-2" /> Back to Note
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{note.title} - Flashcards</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Card {currentCardIndex + 1} of {note.flashcards.length}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-xl">{currentCard.question}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={toggleAnswer} size="lg">
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
        </CardFooter>
      </Card>

      {showAnswer && (
        <Card className="mb-6 border-primary">
          <CardHeader className="text-center">
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="text-lg">{currentCard.answer}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={prevCard} 
          disabled={currentCardIndex === 0}
          className="gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Button 
          onClick={nextCard} 
          className="gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
      
      <div className="mt-4 bg-muted h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full"
          style={{ width: `${((currentCardIndex + 1) / note.flashcards.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}