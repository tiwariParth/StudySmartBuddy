import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Note from '../models/Note';
import Flashcard from '../models/Flashcard';

// Ensure exports directory exists
const exportsDir = path.join(process.cwd(), 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

/**
 * Export note and its flashcards to Markdown format
 */
export const exportToMarkdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
      return;
    }

    // Get note with populated flashcards
    const note = await Note.findById(noteId).populate('flashcards');
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    // Generate markdown content
    let markdown = `# ${note.title}\n\n`;
    
    // Add summary section
    markdown += `## Summary\n\n${note.summary}\n\n`;
    
    // Add flashcards section
    markdown += `## Flashcards\n\n`;
    
    if (note.flashcards && note.flashcards.length > 0) {
      note.flashcards.forEach((card: any, index: number) => {
        markdown += `### Card ${index + 1}\n\n`;
        markdown += `**Q:** ${card.question}\n\n`;
        markdown += `**A:** ${card.answer}\n\n`;
      });
    } else {
      markdown += `No flashcards available for this note.\n\n`;
    }
    
    // Generate timestamp-based filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${note.title.replace(/\s+/g, '_')}_${timestamp}.md`;
    const filePath = path.join(exportsDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, markdown, 'utf8');
    
    res.status(200).json({
      success: true,
      message: 'Content exported to Markdown successfully',
      filename,
      filePath: `/exports/${filename}`,
      markdown
    });
  } catch (error) {
    console.error('Error in exportToMarkdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export content to Markdown'
    });
  }
};

/**
 * Export flashcards to Anki-compatible format (CSV)
 * This can be imported into Anki using their import feature
 */
export const exportToAnki = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
      return;
    }

    // Get note with populated flashcards
    const note = await Note.findById(noteId).populate('flashcards');
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    // Check if there are flashcards
    if (!note.flashcards || note.flashcards.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No flashcards found for this note'
      });
      return;
    }

    // Generate Anki-compatible CSV content
    // Format: "question","answer","tags"
    let csvContent = '';
    
    note.flashcards.forEach((card: any) => {
      // Escape double quotes in question and answer
      const question = card.question.replace(/"/g, '""');
      const answer = card.answer.replace(/"/g, '""');
      
      csvContent += `"${question}","${answer}","${note.title}"\n`;
    });
    
    // Generate timestamp-based filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${note.title.replace(/\s+/g, '_')}_${timestamp}.csv`;
    const filePath = path.join(exportsDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, csvContent, 'utf8');
    
    res.status(200).json({
      success: true,
      message: 'Content exported to Anki-compatible format successfully',
      filename,
      filePath: `/exports/${filename}`,
      csvContent
    });
  } catch (error) {
    console.error('Error in exportToAnki:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export content to Anki format'
    });
  }
};

export default {
  exportToMarkdown,
  exportToAnki
};