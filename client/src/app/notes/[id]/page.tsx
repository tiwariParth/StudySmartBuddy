"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ArrowLeft, Download, FileText, DownloadCloud, Loader2, AlertCircle } from "lucide-react";

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

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
        // Use the API client method instead of fetch directly
        const data = await api.getNoteById(id as string);
        setNote(data.note);
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
      }
    } catch (err: any) {
      console.error("Failed to generate flashcards:", err);
      setError(err.message || "Failed to generate flashcards. Please try again.");
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
    return (
      <div className="container py-12 flex justify-center">
        <div className="flex items-center">
          <Loader2 className="mr-2 animate-spin" />
          Loading note...
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <AlertCircle className="inline-block mr-2" />
          {error || "Failed to load note"}
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{note.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Created on {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="prose max-w-none">
              {note.summary.split('\n').map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
            
            {note.flashcards && note.flashcards.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {note.flashcards.length} flashcards available
                </p>
                <Button asChild className="w-full">
                  <Link href={`/flashcards/${note._id}`}>
                    <FileText size={16} className="mr-2" />
                    Practice Flashcards
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No flashcards yet. Generate them from your note.
                </p>
                <Button onClick={handleGenerateFlashcards} className="w-full">
                  Generate Flashcards
                </Button>
              </div>
            )}
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Export</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('markdown')}
                disabled={exportLoading !== null}
              >
                {exportLoading === 'markdown' ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export as Markdown
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('anki')}
                disabled={exportLoading !== null}
              >
                {exportLoading === 'anki' ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <DownloadCloud size={16} className="mr-2" />
                )}
                Export to Anki
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
