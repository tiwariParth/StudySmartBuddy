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
  BrainCircuit,
  Pencil,
  Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
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
      
      const response = await api.generateFlashcards(note.rawText);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to generate flashcards");
      }
      
      const saveResponse = await api.saveFlashcards({
        userId: "test-user-123",
        noteId: note._id,
        flashcards: response.flashcards
      });
      
      if (saveResponse.success) {
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
      
      const blob = new Blob([format === 'markdown' ? response.markdown : response.csvContent], 
                            { type: format === 'markdown' ? 'text/markdown' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error(`Failed to export to ${format}:`, err);
      setError(err.message || `Failed to export to ${format}. Please try again.`);
    } finally {
      setExportLoading(null);
    }
  };

  const handleEdit = () => {
    setEditedTitle(note?.title || "");
    setEditedSummary(note?.summary || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!note) return;
    
    try {
      setIsEditing(true);
      
      const response = await api.updateNote({
        _id: note._id,
        title: editedTitle,
        summary: editedSummary
      });
      
      if (response && response.success) {
        // Update the local note state with the edited data
        setNote({
          ...note,
          title: editedTitle,
          summary: editedSummary
        });
        setIsEditDialogOpen(false);
      } else {
        throw new Error(response?.message || "Failed to update note");
      }
    } catch (err: any) {
      console.error("Failed to update note:", err);
      setError(err.message || "Failed to update note. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    try {
      setIsDeleting(true);
      
      const response = await api.deleteNote(note._id);
      
      if (response && response.success) {
        router.push('/dashboard');
      } else {
        throw new Error(response?.message || "Failed to delete note");
      }
    } catch (err: any) {
      console.error("Failed to delete note:", err);
      setError(err.message || "Failed to delete note. Please try again.");
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructiveOutline" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="hover:shadow-md transition-all duration-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader size="sm" text="Deleting..." /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent className="sm:max-w-[525px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Note
            </AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your note's title and summary below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Summary
              </label>
              <textarea
                id="summary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={6}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEditing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSaveEdit} 
              disabled={isEditing || !editedTitle.trim() || !editedSummary.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEditing ? <Loader size="sm" text="Saving..." /> : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
