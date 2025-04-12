"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { Loader2, Upload, Check, AlertCircle, FileTextIcon } from "lucide-react";

// Mock user ID - in a real app, this would come from authentication
const USER_ID = "test-user-123";

type UploadStatus = "idle" | "uploading" | "extracting" | "summarizing" | "saving" | "complete" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size exceeds 10MB limit");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload");
      return;
    }
    
    try {
      // Reset any previous errors
      setError(null);
      
      // Step 1: Upload PDF
      setStatus("uploading");
      setProgress(20);
      const uploadResult = await api.uploadPDF(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Failed to upload PDF");
      }
      
      // Step 2: Extract text from PDF using the server's PDF extraction utility
      setStatus("extracting");
      setProgress(40);
      const extractResult = await api.extractText(uploadResult.file.path);
      
      if (!extractResult.success) {
        throw new Error(extractResult.message || "Failed to extract text from PDF");
      }
      
      setExtractedText(extractResult.text);
      
      // Step 3: Generate summary using the server's OpenAI integration
      setStatus("summarizing");
      setProgress(60);
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      const summaryResult = await api.generateSummary(extractResult.text, title);
      
      if (!summaryResult.success) {
        throw new Error(summaryResult.message || "Failed to generate summary");
      }
      
      setSummary(summaryResult.summary);
      
      // Step 4: Save note to database
      setStatus("saving");
      setProgress(80);
      const saveResult = await api.saveNote({
        userId: USER_ID,
        title: title,
        rawText: extractResult.text,
        summary: summaryResult.summary,
        pdfUrl: uploadResult.file.path
      });
      
      if (!saveResult.success) {
        throw new Error(saveResult.message || "Failed to save note");
      }
      
      // Complete
      setStatus("complete");
      setProgress(100);
      setNoteId(saveResult.note._id);
      
      // Redirect to the note page after a brief delay
      setTimeout(() => {
        router.push(`/notes/${saveResult.note._id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error("Upload process failed:", err);
      setStatus("error");
      setError(err.message || "An error occurred during the upload process");
    }
  };

  const renderProgressStatus = () => {
    switch (status) {
      case "uploading":
        return { 
          text: "Uploading your PDF...",
          icon: <Loader2 className="animate-spin mr-2" size={20} />
        };
      case "extracting":
        return { 
          text: "Extracting text from PDF...",
          icon: <Loader2 className="animate-spin mr-2" size={20} />
        };
      case "summarizing":
        return { 
          text: "Generating AI summary using OpenAI...",
          icon: <Loader2 className="animate-spin mr-2" size={20} />
        };
      case "saving":
        return { 
          text: "Saving your note...",
          icon: <Loader2 className="animate-spin mr-2" size={20} />
        };
      case "complete":
        return { 
          text: "Processing complete! Redirecting to your note...",
          icon: <Check className="text-green-500 mr-2" size={20} />
        };
      default:
        return { text: "", icon: null };
    }
  };

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Upload PDF</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div 
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={status !== "idle" && status !== "error"}
            />
            {file ? (
              <>
                <FileTextIcon size={48} className="mb-4 text-primary mx-auto" />
                <p className="text-lg font-medium mb-2">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload size={48} className="mb-4 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">PDF (Max 10MB)</p>
              </>
            )}
          </div>

          {status !== "idle" && status !== "error" && (
            <div className="mt-6">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center">
                {renderProgressStatus().icon}
                <p>{renderProgressStatus().text}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!file || (status !== "idle" && status !== "error")}
              className="gap-2"
            >
              {status === "idle" || status === "error" ? (
                <>Process PDF</>
              ) : (
                <>Processing...</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
