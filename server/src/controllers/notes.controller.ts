import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from '../utils/pdfUtils';
import { generateSummary } from '../utils/aiService';
import Note from '../models/Note';
import Flashcard from '../models/Flashcard';  

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Handle PDF upload and return file info
 */
export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      file: req.file
    });
  } catch (error) {
    console.error('Error in uploadPdf:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF'
    });
  }
};

/**
 * Extract text from an uploaded PDF file
 */
export const extractText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      res.status(400).json({
        success: false,
        message: 'File path is required'
      });
      return;
    }

    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    const text = await extractTextFromPDF(fullPath);

    res.status(200).json({
      success: true,
      message: 'Text extracted successfully',
      text
    });
  } catch (error) {
    console.error('Error in extractText:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text from PDF'
    });
  }
};

/**
 * Generate summary from text content
 */
export const generateNoteSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, title } = req.body;
    
    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Text content is required'
      });
      return;
    }

    const summary = await generateSummary(text);

    res.status(200).json({
      success: true,
      message: 'Summary generated successfully',
      summary,
      title: title || 'Untitled Note',
      rawText: text
    });
  } catch (error) {
    console.error('Error in generateSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary'
    });
  }
};

/**
 * Save a note to the database
 */
export const saveNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, rawText, summary, pdfUrl } = req.body;
    
    if (!userId || !title || !rawText || !summary) {
      res.status(400).json({
        success: false,
        message: 'UserId, title, rawText, and summary are required'
      });
      return;
    }

    const newNote = new Note({
      userId,
      title,
      rawText,
      summary,
      pdfUrl,
      flashcards: [] // Will be populated later
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      note: savedNote
    });
  } catch (error) {
    console.error('Error in saveNote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save note'
    });
  }
};

/**
 * Get all notes for a specific user
 */
export const getUserNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const notes = await Note.find({ userId })
      .select('_id userId title summary createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      notes
    });
  } catch (error) {
    console.error('Error in getUserNotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes'
    });
  }
};

/**
 * Get a specific note by ID
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    
    if (!noteId) {
      res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
      return;
    }

    const note = await Note.findById(noteId).populate('flashcards');

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note retrieved successfully',
      note
    });
  } catch (error) {
    console.error('Error in getNoteById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve note'
    });
  }
};

/**
 * Delete a note and its associated flashcards
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
      return;
    }

    const note = await Note.findById(id);
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    if (note.flashcards && note.flashcards.length > 0) {
      await Flashcard.deleteMany({ _id: { $in: note.flashcards } });
    }
    
    await Note.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Note and associated flashcards deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

/**
 * Update a note's title and summary
 */
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, summary } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
      return;
    }
    
    if (!title && !summary) {
      res.status(400).json({
        success: false,
        message: 'At least one field (title or summary) is required for update'
      });
      return;
    }

    // Use findByIdAndUpdate instead of findById + save
    // This is more efficient and less prone to connection issues
    const updateData: { title?: string; summary?: string } = {};
    if (title) updateData.title = title;
    if (summary) updateData.summary = summary;
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedNote) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    console.error('Error in updateNote:', error);
    // Ensure we're sending a proper response even on error
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};