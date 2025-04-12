import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/navbar';
import './globals.css';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudySmartBuddy - AI-Powered Study Assistant',
  description: 'Transform PDFs into summaries and flashcards with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
