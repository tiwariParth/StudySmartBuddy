import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Study<span className="text-primary">Smart</span>Buddy
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl text-muted-foreground">
          Transform your study materials into interactive summaries and flashcards using AI
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/upload">
            <Button size="lg" variant="outline" className="gap-2">
              <Upload size={20} />
              Upload PDF
            </Button>
          </Link>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          <FeatureCard 
            title="AI-Powered Summaries"
            description="Upload PDFs and get instant AI-generated summaries to enhance your understanding."
          />
          <FeatureCard 
            title="Flashcard Generation"
            description="Create study flashcards automatically from your notes and documents."
          />
          <FeatureCard 
            title="Export Anywhere"
            description="Export your notes and flashcards to Markdown or Anki format."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border rounded-lg p-6 text-left bg-card">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
