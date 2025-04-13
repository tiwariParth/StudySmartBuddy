/**
 * In-memory database fallback when MongoDB is unavailable
 * This provides basic CRUD operations without requiring MongoDB
 */

// Basic types for our in-memory store
interface InMemoryNote {
  _id: string;
  userId: string;
  title: string;
  content?: string;
  rawText?: string;
  summary?: string;
  pdfUrl?: string;
  flashcards: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface InMemoryFlashcard {
  _id: string;
  userId: string;
  noteId: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryDatabase {
  private notes: InMemoryNote[] = [];
  private flashcards: InMemoryFlashcard[] = [];
  private noteIdCounter = 1;
  private flashcardIdCounter = 1;
  
  // Note operations
  createNote(noteData: Omit<InMemoryNote, '_id' | 'createdAt' | 'updatedAt'>): InMemoryNote {
    const now = new Date();
    const newNote: InMemoryNote = {
      _id: `n_${this.noteIdCounter++}`,
      ...noteData,
      flashcards: noteData.flashcards || [],
      createdAt: now,
      updatedAt: now
    };
    
    this.notes.push(newNote);
    return newNote;
  }
  
  findNoteById(id: string): InMemoryNote | null {
    return this.notes.find(note => note._id === id) || null;
  }
  
  findNotesByUserId(userId: string): InMemoryNote[] {
    return this.notes
      .filter(note => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  updateNote(id: string, update: Partial<InMemoryNote>): InMemoryNote | null {
    const index = this.notes.findIndex(note => note._id === id);
    if (index === -1) return null;
    
    this.notes[index] = {
      ...this.notes[index],
      ...update,
      _id: this.notes[index]._id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    return this.notes[index];
  }
  
  deleteNote(id: string): boolean {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note._id !== id);
    
    // Also delete associated flashcards
    this.flashcards = this.flashcards.filter(card => card.noteId !== id);
    
    return this.notes.length < initialLength;
  }
  
  // Flashcard operations
  createFlashcard(cardData: Omit<InMemoryFlashcard, '_id' | 'createdAt' | 'updatedAt'>): InMemoryFlashcard {
    const now = new Date();
    const newCard: InMemoryFlashcard = {
      _id: `f_${this.flashcardIdCounter++}`,
      ...cardData,
      createdAt: now,
      updatedAt: now
    };
    
    this.flashcards.push(newCard);
    
    // Add reference to the note
    const noteIndex = this.notes.findIndex(note => note._id === cardData.noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex].flashcards.push(newCard._id);
    }
    
    return newCard;
  }
  
  findFlashcardById(id: string): InMemoryFlashcard | null {
    return this.flashcards.find(card => card._id === id) || null;
  }
  
  findFlashcardsByNoteId(noteId: string): InMemoryFlashcard[] {
    return this.flashcards.filter(card => card.noteId === noteId);
  }
  
  updateFlashcard(id: string, update: Partial<InMemoryFlashcard>): InMemoryFlashcard | null {
    const index = this.flashcards.findIndex(card => card._id === id);
    if (index === -1) return null;
    
    this.flashcards[index] = {
      ...this.flashcards[index],
      ...update,
      _id: this.flashcards[index]._id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    return this.flashcards[index];
  }
  
  deleteFlashcard(id: string): boolean {
    const card = this.flashcards.find(c => c._id === id);
    if (!card) return false;
    
    // Remove from flashcards array
    this.flashcards = this.flashcards.filter(c => c._id !== id);
    
    // Remove reference from note
    const noteIndex = this.notes.findIndex(note => note._id === card.noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex].flashcards = this.notes[noteIndex].flashcards
        .filter(flashcardId => flashcardId !== id);
    }
    
    return true;
  }
  
  // Utility methods for populating related data
  populateFlashcardsForNote(noteId: string): InMemoryNote | null {
    const note = this.findNoteById(noteId);
    if (!note) return null;
    
    // Replace flashcard IDs with actual flashcard objects
    const populatedNote = { ...note };
    const flashcards = this.findFlashcardsByNoteId(noteId);
    
    // @ts-ignore - this is intentional for populating
    populatedNote.flashcards = flashcards;
    
    return populatedNote;
  }
}

// Export singleton instance
export const inMemoryDb = new InMemoryDatabase();
