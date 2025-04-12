"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageLoader, Loader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { FileIcon, Plus, Clock, AlertCircle } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

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

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Study Materials</h1>
        <Link href="/upload">
          <Button className="gap-2">
            <Plus size={16} />
            New Upload
          </Button>
        </Link>
      </div>

      {loading && <PageLoader text="Loading your study materials..." />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start" role="alert">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && notes.length === 0 && !error && (
        <div className="text-center py-12">
          <FileIcon size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">Upload a PDF to get started with your study journey</p>
          <Link href="/upload">
            <Button>Upload your first PDF</Button>
          </Link>
        </div>
      )}

      {notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link href={`/notes/${note._id}`} key={note._id}>
              <Card className="h-full hover:shadow-md transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {truncateText(note.summary, 150)}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    {formatDate(note.createdAt)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
