"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageLoader, Loader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  DownloadCloud, 
  AlertCircle,
  BookOpen,
  BrainCircuit
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

type Note = {
  _id: string;
  title: string;
  rawText: string;
  summary: string;
  flashcards: Array<{
    _id: string;
    question: string;
    answer: string;
  }>;
  createdAt: string;
};

export default function NotePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<'markdown' | 'anki' | null>(null);
  const [flashcardLoading, setFlashcardLoading] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
        // Use the API client method instead of fetch directly
        const data = await api.getNoteById(id as string);
        
        if (data && data.success) {
          setNote(data.note);
        } else {
          throw new Error(data?.message || "Failed to fetch note data");
        }
      } catch (err: any) {
        console.error("Failed to fetch note:", err);
        setError(err.message || "Failed to load note. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchNote();
    }
  }, [id]);

  const handleGenerateFlashcards = async () => {
    if (!note) return;
    
    try {
      setFlashcardLoading(true);
      
      // Request flashcard generation
      const response = await api.generateFlashcards(note.rawText);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to generate flashcards");
      }
      
      // Save generated flashcards
      const saveResponse = await api.saveFlashcards({
        userId: "test-user-123", // Mock user ID
        noteId: note._id,
        flashcards: response.flashcards
      });
      
      if (saveResponse.success) {
        // Update the local note state with new flashcards
        setNote({
          ...note,
          flashcards: saveResponse.flashcards
        });
      } else {
        throw new Error(saveResponse.message || "Failed to save flashcards");
      }
    } catch (err: any) {
      console.error("Failed to generate flashcards:", err);
      setError(err.message || "Failed to generate flashcards. Please try again.");
    } finally {
      setFlashcardLoading(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'anki') => {
    if (!note) return;
    
    try {
      setExportLoading(format);
      let response;
      
      if (format === 'markdown') {
        response = await api.exportToMarkdown(note._id);
      } else {
        response = await api.exportToAnki(note._id);
      }
      
      if (!response.success) {
        throw new Error(response.message || `Failed to export to ${format}`);
      }
      
      // Create a download link for the file
      const blob = new Blob([format === 'markdown' ? response.markdown : response.csvContent], 
                            { type: format === 'markdown' ? 'text/markdown' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error(`Failed to export to ${format}:`, err);
      setError(err.message || `Failed to export to ${format}. Please try again.`);
    } finally {
      setExportLoading(null);
    }
  };

  if (loading) {
    return <PageLoader text="Loading note..." />;
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
          <span>{error || "Failed to load note"}</span>
        </motion.div>
        <Button asChild className="transition-transform hover:scale-105 active:scale-95">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.4,
      }
    }
  };
  
  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="container py-8 max-w-5xl px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Button variant="outline" asChild className="mb-4 transition-all hover:bg-primary/5">
          <Link href="/dashboard">
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          {note.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Created on {formatDate(note.createdAt)}
        </p>
      </motion.div>
      
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <motion.div 
          variants={fadeInUp} 
          className="lg:col-span-2"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 shadow-md dark:shadow-slate-800/20">
              <CardHeader className="border-b">
                <CardTitle>
                  <div className="flex items-center text-primary">
                    <BookOpen size={18} className="mr-2" />
                    Summary
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="prose dark:prose-invert max-w-none"
                >
                  {note.summary.split('\n').map((paragraph, i) => (
                    <p key={i} className={i > 0 ? "mt-4" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp} 
          className="space-y-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-2 shadow-md dark:shadow-slate-800/20">
              <CardHeader className="border-b">
                <CardTitle>
                  <div className="flex items-center text-primary">
                    <FileText size={18} className="mr-2" />
                    Flashcards
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {note.flashcards && note.flashcards.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg mb-4">
                      <BrainCircuit className="text-primary mr-3" size={24} />
                      <p className="font-medium">{note.flashcards.length} flashcards available</p>
                    </div>
                    <Button 
                      asChild 
                      size="lg"
                      className="w-full transition-transform hover:scale-105 active:scale-95"
                    >
                      <Link href={`/flashcards/${note._id}`}>
                        Practice Flashcards
                      </Link>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No flashcards yet. Generate them from your note.
                    </p>
                    <Button 
                      onClick={handleGenerateFlashcards} 
                      className="w-full transition-transform hover:scale-105 active:scale-95"
                      disabled={flashcardLoading}
                    >
                      {flashcardLoading ? (
                        <Loader text="Generating..." size="sm" />
                      ) : (
                        'Generate Flashcards'
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-2 shadow-md dark:shadow-slate-800/20">
              <CardHeader className="border-b">
                <CardTitle>
                  <div className="flex items-center text-primary">
                    <Download size={18} className="mr-2" />
                    Export
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start transition-all hover:bg-primary/5"
                  onClick={() => handleExport('markdown')}
                  disabled={exportLoading !== null}
                >
                  {exportLoading === 'markdown' ? (
                    <Loader size="sm" text="Exporting..." />
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Export as Markdown
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start transition-all hover:bg-primary/5"
                  onClick={() => handleExport('anki')}
                  disabled={exportLoading !== null}
                >
                  {exportLoading === 'anki' ? (
                    <Loader size="sm" text="Exporting..." />
                  ) : (
                    <>
                      <DownloadCloud size={16} className="mr-2" />
                      Export to Anki
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
