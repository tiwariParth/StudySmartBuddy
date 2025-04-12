"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { api } from "@/lib/api";
import { Loader2, Upload, Check, AlertCircle, FileTextIcon, FileText } from "lucide-react";
import { motion } from "framer-motion";

// Mock user ID - in a real app, this would come from authentication
const USER_ID = "test-user-123";

type UploadStatus = "idle" | "uploading" | "extracting" | "summarizing" | "saving" | "complete" | "error";

// Animation variants
const fadeIn = {
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

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
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
    <div className="container max-w-4xl py-12 px-4 sm:px-6">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400"
      >
        Upload Study Materials
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 border-2 shadow-md dark:shadow-slate-800/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "hover:bg-muted/50 border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => document.getElementById('pdf-upload')?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={status !== "idle" && status !== "error"}
              />
              
              <motion.div 
                initial="hidden"
                animate="show"
                variants={fadeIn}
              >
                {file ? (
                  <>
                    <div className="bg-primary/10 p-4 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                      <FileText size={48} className="text-primary" />
                    </div>
                    <p className="text-lg font-medium mb-2">{file.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm"
                      disabled={status !== "idle" && status !== "error"}
                    >
                      Change file
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-muted rounded-full p-4 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                      <Upload size={48} className="text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">
                      {dragActive ? "Drop your PDF here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">PDF files only (Max 10MB)</p>
                  </>
                )}
              </motion.div>
            </div>

            {status !== "idle" && status !== "error" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-center text-center">
                  {renderProgressStatus().icon}
                  <p>{renderProgressStatus().text}</p>
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-start"
              >
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!file || (status !== "idle" && status !== "error")}
                className="gap-2 px-6 transition-transform hover:scale-105 active:scale-95"
              >
                {status === "idle" || status === "error" ? (
                  <>
                    <Upload className="w-4 h-4" />
                    Process PDF
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
      
      {/* Information cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="p-5 border-2 shadow-sm dark:shadow-slate-800/10 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Supported Formats</h3>
              <p className="text-sm text-muted-foreground">
                We currently support PDF files up to 10MB in size. More formats coming soon.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-2 shadow-sm dark:shadow-slate-800/10 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-md bg-primary/10">
              <Loader2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Processing Time</h3>
              <p className="text-sm text-muted-foreground">
                Processing typically takes 15-30 seconds depending on the document length and complexity.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
