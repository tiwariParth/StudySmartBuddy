"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Upload, Brain, Download, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

// Animation variants for staggered animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto text-center px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto mb-12 relative z-10"
          >
            {/* Animated background gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-3xl opacity-50 dark:opacity-30 -z-10 animate-pulse"></div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Study<span className="text-primary">Smart</span>Buddy
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl mb-10 text-slate-700 dark:text-slate-300"
            >
              Transform your study materials into interactive summaries and flashcards using AI
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-6"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  Upload PDF
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 bg-primary/10 p-4 rounded-full">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload PDF</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload any PDF document containing study materials or lecture notes.
              </p>
            </motion.div>
            
            <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 bg-primary/10 p-4 rounded-full">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. AI Processing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI analyzes your document and creates summaries and flashcards.
              </p>
            </motion.div>
            
            <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 bg-primary/10 p-4 rounded-full">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Study & Practice</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Review AI-generated summaries and practice with flashcards to improve retention.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Cards Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Key Features
          </motion.h2>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={item}>
              <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    AI-Powered Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Upload PDFs and get instant AI-generated summaries to enhance your understanding.
                    Our AI extracts the most important concepts and presents them in an easy-to-digest format.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Book className="h-5 w-5 text-primary" />
                    </div>
                    Flashcard Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create study flashcards automatically from your notes and documents.
                    Practice with these flashcards to reinforce your learning and improve retention.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    Export Anywhere
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Export your notes and flashcards to Markdown or Anki format for seamless integration
                    with your existing study workflow and tools.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 overflow-hidden relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600"></div>
        
        {/* Background pattern */}
        {mounted && (
          <div className="absolute inset-0">
            <svg className="absolute bottom-0 left-0 right-0 opacity-10" viewBox="0 0 1440 320">
              <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,117.3C960,107,1056,149,1152,160C1248,171,1344,149,1392,138.7L1440,128L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        )}
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your study experience?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join thousands of students who are studying smarter, not harder, with StudySmartBuddy.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/upload">
                <Button size="lg" variant="secondary" className="gap-2 px-8 py-6 text-lg font-medium">
                  <Upload className="w-5 h-5" /> Upload Your First PDF
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
