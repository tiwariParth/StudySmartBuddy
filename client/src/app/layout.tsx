import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/navbar';
import './globals.css';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudySmartBuddy - AI-Powered Study Assistant',
  description: 'Transform PDFs into interactive summaries and flashcards with AI to enhance your study experience',
  keywords: 'study, AI, flashcards, notes, learning, education, PDF',
  authors: [{ name: 'StudySmartBuddy Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-6 border-t">
            <div className="container text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} StudySmartBuddy. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
