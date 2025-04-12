import { Request, Response } from 'express';
import { generateFlashcards } from '../utils/aiService';
import Flashcard from '../models/Flashcard';
import Note from '../models/Note';
import mongoose from 'mongoose';

/**
 * Generate flashcards from text content
 */
export const generateFlashcardsForText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    
    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Text content is required'
      });
      return;
    }

    const flashcards = await generateFlashcards(text);

    res.status(200).json({
      success: true,
      message: 'Flashcards generated successfully',
      flashcards
    });
  } catch (error) {
    console.error('Error in generateFlashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate flashcards'
    });
  }
};

/**
 * Save flashcards to the database associated with a note
 */
export const saveFlashcards = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { userId, noteId, flashcards } = req.body;
    
    if (!userId || !noteId || !flashcards || !Array.isArray(flashcards)) {
      res.status(400).json({
        success: false,
        message: 'UserId, noteId, and flashcards array are required'
      });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const note = await Note.findById(noteId);
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      await session.abortTransaction();
      session.endSession();
      return;
    }
    
    // Create flashcard documents
    const flashcardPromises = flashcards.map(({ question, answer }: { question: string, answer: string }) => {
      const newFlashcard = new Flashcard({
        userId,
        noteId,
        question,
        answer
      });
      return newFlashcard.save({ session });
    });
    
    const savedFlashcards = await Promise.all(flashcardPromises);
    
    // Update the note with flashcard IDs
    note.flashcards = savedFlashcards.map(card => card._id);
    await note.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: 'Flashcards saved successfully',
      flashcards: savedFlashcards
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error in saveFlashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save flashcards'
    });
  }
};

/**
 * Get all flashcards for a specific user
 */
export const getUserFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const flashcards = await Flashcard.find({ userId })
      .populate('noteId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Flashcards retrieved successfully',
      flashcards
    });
  } catch (error) {
    console.error('Error in getUserFlashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flashcards'
    });
  }
};

/**
 * Update a specific flashcard
 */
export const updateFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Flashcard ID is required'
      });
      return;
    }

    const flashcard = await Flashcard.findById(id);
    
    if (!flashcard) {
      res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
      return;
    }

    // Update the flashcard
    flashcard.question = question || flashcard.question;
    flashcard.answer = answer || flashcard.answer;
    
    const updatedFlashcard = await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Flashcard updated successfully',
      flashcard: updatedFlashcard
    });
  } catch (error) {
    console.error('Error in updateFlashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update flashcard'
    });
  }
};

/**
 * Delete a specific flashcard
 */
export const deleteFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Flashcard ID is required'
      });
      return;
    }

    const deletedFlashcard = await Flashcard.findByIdAndDelete(id);
    
    if (!deletedFlashcard) {
      res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
      return;
    }
    
    // Also remove from the note's flashcards array
    await Note.updateOne(
      { _id: deletedFlashcard.noteId },
      { $pull: { flashcards: deletedFlashcard._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteFlashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard'
    });
  }
};

export default {
  generateFlashcardsForText,
  saveFlashcards,
  getUserFlashcards,
  updateFlashcard,
  deleteFlashcard
};