import { Request, Response } from 'express';
import FlashcardModel from '../models/Flashcard';
import NoteModel from '../models/Note';
import { generateFlashcards } from '../utils/aiService';

/**
 * Generate flashcards from a text
 * @route POST /api/flashcards/generate
 */
export const generateFlashcardsForText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ success: false, message: 'Text content is required' });
      return;
    }

    const flashcards = await generateFlashcards(text);
    
    res.status(200).json({
      success: true,
      flashcards
    });
  } catch (error: any) {
    console.error('Error in generateFlashcards:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate flashcards' 
    });
  }
};

/**
 * Save flashcards to a note
 * @route POST /api/flashcards/save
 */
export const saveFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, noteId, flashcards } = req.body;
    
    if (!userId || !noteId || !flashcards || !Array.isArray(flashcards)) {
      res.status(400).json({ 
        success: false, 
        message: 'userId, noteId, and flashcards array are required' 
      });
      return;
    }

    // Find the note first
    const note = await NoteModel.findById(noteId);
    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    // Save each flashcard and collect their IDs
    const savedFlashcards = [];
    for (const card of flashcards) {
      const flashcard = new FlashcardModel({
        userId, 
        noteId,
        question: card.question,
        answer: card.answer
      });
      
      await flashcard.save();
      savedFlashcards.push(flashcard);
    }

    // Update the note with reference to flashcards
    note.flashcards = savedFlashcards.map(card => card._id);
    await note.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Flashcards saved successfully',
      flashcards: savedFlashcards
    });
  } catch (error: any) {
    console.error('Error in saveFlashcards:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to save flashcards' 
    });
  }
};

/**
 * Get all flashcards for a note
 * @route GET /api/flashcards
 */
export const getFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.query;
    
    if (!noteId) {
      res.status(400).json({ success: false, message: 'Note ID is required' });
      return;
    }
    
    const flashcards = await FlashcardModel.find({ noteId });
    
    res.status(200).json({
      success: true,
      flashcards
    });
  } catch (error: any) {
    console.error('Error in getFlashcards:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch flashcards' 
    });
  }
};

/**
 * Get all flashcards for a specific user, grouped by notes
 * @route GET /api/flashcards/user/:userId
 */
export const getUserFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    
    // Find all notes belonging to the user
    const userNotes = await NoteModel.find({ userId }).lean();
    
    if (!userNotes || userNotes.length === 0) {
      res.status(200).json({
        success: true,
        flashcardGroups: []
      });
      return;
    }
    
    // Get all note IDs
    const noteIds = userNotes.map(note => note._id);
    
    // Find all flashcards associated with these notes
    const allFlashcards = await FlashcardModel.find({ noteId: { $in: noteIds } }).lean();
    
    if (!allFlashcards || allFlashcards.length === 0) {
      res.status(200).json({
        success: true,
        flashcardGroups: []
      });
      return;
    }
    
    // Group flashcards by note ID
    const flashcardsByNote: Record<string, any[]> = {};
    allFlashcards.forEach(flashcard => {
      const noteIdString = flashcard.noteId.toString();
      if (!flashcardsByNote[noteIdString]) {
        flashcardsByNote[noteIdString] = [];
      }
      flashcardsByNote[noteIdString].push(flashcard);
    });
    
    // Create flashcard groups with note info
    const flashcardGroups = userNotes
      .filter(note => {
        const noteIdString = note._id.toString();
        return flashcardsByNote[noteIdString] && flashcardsByNote[noteIdString].length > 0;
      })
      .map(note => {
        const noteIdString = note._id.toString();
        const noteFlashcards = flashcardsByNote[noteIdString] || [];
        
        return {
          noteId: noteIdString,
          noteTitle: note.title,
          count: noteFlashcards.length,
          flashcards: noteFlashcards,
          createdAt: note.createdAt
        };
      })
      // Sort by most recently created notes first
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json({
      success: true,
      flashcardGroups
    });
  } catch (error: any) {
    console.error('Error in getUserFlashcards:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch user flashcards' 
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

    const flashcard = await FlashcardModel.findById(id);
    
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

    const deletedFlashcard = await FlashcardModel.findByIdAndDelete(id);
    
    if (!deletedFlashcard) {
      res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
      return;
    }
    
    // Also remove from the note's flashcards array
    await NoteModel.updateOne(
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
  getFlashcards,
  getUserFlashcards,
  updateFlashcard,
  deleteFlashcard
};