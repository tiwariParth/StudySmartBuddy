import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Upload, Brain, Download, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto text-center px-6">
            <div className="max-w-4xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                Study<span className="text-primary">Smart</span>Buddy
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-muted-foreground">
                Transform your study materials into interactive summaries and flashcards using AI
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 text-base px-8 py-6">
                    <Book className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline" className="flex items-center gap-2 text-base px-8 py-6">
                    <Upload className="w-5 h-5" />
                    Upload PDF
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-6 bg-primary/10 p-4 rounded-full">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Upload PDF</h3>
                <p className="text-muted-foreground">
                  Upload any PDF document containing study materials or lecture notes.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-6 bg-primary/10 p-4 rounded-full">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. AI Processing</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your document and creates summaries and flashcards.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-6 bg-primary/10 p-4 rounded-full">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Study & Practice</h3>
                <p className="text-muted-foreground">
                  Review AI-generated summaries and practice with flashcards to improve retention.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Cards Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>AI-Powered Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload PDFs and get instant AI-generated summaries to enhance your understanding.
                    Our AI extracts the most important concepts and presents them in an easy-to-digest format.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Flashcard Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create study flashcards automatically from your notes and documents.
                    Practice with these flashcards to reinforce your learning and improve retention.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Export Anywhere</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Export your notes and flashcards to Markdown or Anki format for seamless integration
                    with your existing study workflow and tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your study experience?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students who are studying smarter, not harder, with StudySmartBuddy.
            </p>
            <Link href="/upload">
              <Button size="lg" variant="secondary" className="gap-2">
                <Upload className="w-5 h-5" /> Upload Your First PDF
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
