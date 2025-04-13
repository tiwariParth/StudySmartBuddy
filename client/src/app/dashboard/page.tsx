"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageLoader, Loader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { Plus, Clock, AlertCircle, BookOpenText, Search, Trash2, MoreHorizontal } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

// Enhanced card hover animation variant
const cardHover = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

// Mock user ID - in a real app this would come from authentication
const USER_ID = "test-user-123";

type Note = {
  _id: string;
  title: string;
  summary: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        const response = await api.getUserNotes(USER_ID);
        
        if (response && response.success) {
          setNotes(response.notes);
        } else {
          throw new Error(response?.message || "Failed to fetch notes");
        }
      } catch (err: any) {
        console.error("Failed to fetch notes:", err);
        setError("Failed to load your notes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, []);

  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const response = await api.deleteNote(noteId);
      
      if (response && response.success) {
        // Remove the note from the local state
        setNotes(notes.filter(note => note._id !== noteId));
      } else {
        throw new Error(response?.message || "Failed to delete note");
      }
    } catch (err: any) {
      console.error("Failed to delete note:", err);
      setDeleteError("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
      setNoteToDelete(null);
    }
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    searchTerm === "" || 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 max-w-7xl">
      {/* Animated gradient background */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-700/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-60 left-0 w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-700/10 rounded-full blur-3xl -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          Your Study Materials
        </h1>
        <Link href="/upload">
          <Button className="gap-2 transition-transform hover:scale-105 active:scale-95">
            <Plus size={16} />
            New Upload
          </Button>
        </Link>
      </motion.div>

      {/* Search bar */}
      <AnimatePresence>
        {notes.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className={`flex items-center border-2 rounded-lg px-3 py-2 ${isSearchFocused ? 'border-primary ring-2 ring-primary/20' : 'border-input'} transition-all duration-200`}>
              <Search size={18} className="text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Search your notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-foreground"
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && 
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PageLoader text="Loading your study materials..." />
        </motion.div>
      }
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-start" 
          role="alert"
        >
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {deleteError && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-start" 
        >
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{deleteError}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {!loading && notes.length === 0 && !error && (
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
              <BookOpenText size={40} className="text-primary" />
            </motion.div>
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-medium mb-2"
            >
              No notes yet
            </motion.h3>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-muted-foreground mb-6 max-w-md mx-auto"
            >
              Upload a PDF to get started with your study journey. We'll help you create summaries and flashcards.
            </motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/upload">
                <Button className="gap-2 transition-transform hover:scale-105 active:scale-95">
                  <Plus size={16} />
                  Upload your first PDF
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {notes.length > 0 && (
        <AnimatePresence>
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No matching notes</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNotes.map((note) => (
                <motion.div 
                  key={note._id} 
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: 20 }}
                  layout
                >
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    variants={cardHover}
                  >
                    <Card className="h-full border-2 hover:border-primary/20 group overflow-hidden relative">
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <Link href={`/notes/${note._id}`} className="flex-1">
                          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                            {note.title}
                          </CardTitle>
                        </Link>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-0 overflow-hidden">
                            <DropdownMenuItem 
                              className="flex items-center px-3 py-3 cursor-pointer bg-white dark:bg-slate-800 border-t-2 border-red-500 text-red-600 dark:text-red-400 font-medium hover:bg-red-500 dark:hover:bg-red-500 hover:text-white dark:hover:text-white focus:bg-red-500 focus:text-white dark:focus:bg-red-500 dark:focus:text-white transition-colors duration-150"
                              onClick={() => setNoteToDelete(note._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      
                      <Link href={`/notes/${note._id}`}>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {truncateText(note.summary, 150)}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={14} className="mr-1" />
                            {formatDate(note.createdAt)}
                          </div>
                        </CardContent>
                        <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"></div>
                      </Link>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note and all its flashcards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (noteToDelete) handleDeleteNote(noteToDelete);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader size="sm" text="Deleting..." /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
