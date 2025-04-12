/**
 * API client for StudySmartBuddy
 * Handles all API communication with the backend server
 */

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.message || response.statusText;
    throw new Error(error);
  }
  
  return data;
}

// API client object with methods for different endpoints
export const api = {
  // Notes endpoints
  async getAllNotes(userId = 'test-user-123') {
    const response = await fetch(`${API_URL}/notes?userId=${userId}`);
    return handleResponse(response);
  },
  
  // Used in components for getting user notes
  async getUserNotes(userId = 'test-user-123') {
    const response = await fetch(`${API_URL}/notes/user/${userId}`);
    return handleResponse(response);
  },
  
  async getNoteById(id: string) {
    const response = await fetch(`${API_URL}/notes/${id}`);
    return handleResponse(response);
  },
  
  async saveNote(noteData: any) {
    const response = await fetch(`${API_URL}/notes/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  },
  
  async deleteNote(id: string) {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
  
  // Flashcard endpoints
  async getFlashcards(noteId: string) {
    const response = await fetch(`${API_URL}/flashcards?noteId=${noteId}`);
    return handleResponse(response);
  },
  
  // Used in components for saving flashcards
  async saveFlashcards(data: {
    userId: string;
    noteId: string;
    flashcards: Array<{ question: string; answer: string }>;
  }) {
    const response = await fetch(`${API_URL}/flashcards/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  async generateFlashcards(text: string) {
    const response = await fetch(`${API_URL}/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },
  
  // PDF processing endpoints
  async uploadPDF(file: File) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await fetch(`${API_URL}/notes/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },
  
  async extractText(filePath: string) {
    const response = await fetch(`${API_URL}/notes/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });
    return handleResponse(response);
  },
  
  async generateSummary(text: string, title: string) {
    const response = await fetch(`${API_URL}/notes/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, title }),
    });
    return handleResponse(response);
  },
  
  // Export endpoints
  async exportToMarkdown(noteId: string) {
    const response = await fetch(`${API_URL}/export/markdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId }),
    });
    return handleResponse(response);
  },
  
  async exportToAnki(noteId: string) {
    const response = await fetch(`${API_URL}/export/anki`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId }),
    });
    return handleResponse(response);
  },
};
