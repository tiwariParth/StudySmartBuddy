const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base API client for StudySmartBuddy
 */
export const api = {
  API_BASE_URL,

  /**
   * Upload a PDF file to the server
   */
  async uploadPDF(file: File) {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_BASE_URL}/notes/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload PDF: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Extract text from an uploaded PDF
   * Note: Server expects the exact filepath returned from upload endpoint
   */
  async extractText(filePath: string) {
    const response = await fetch(`${API_BASE_URL}/notes/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract text: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Generate a summary from text using the server's OpenAI integration
   */
  async generateSummary(text: string, title: string) {
    const response = await fetch(`${API_BASE_URL}/notes/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Save a note
   */
  async saveNote(noteData: {
    userId: string;
    title: string;
    rawText: string;
    summary: string;
    pdfUrl?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/notes/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save note: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get user notes
   */
  async getUserNotes(userId: string) {
    const response = await fetch(`${API_BASE_URL}/notes/user/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get note by ID
   */
  async getNoteById(noteId: string) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch note: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Generate flashcards from text using OpenAI
   */
  async generateFlashcards(text: string) {
    const response = await fetch(`${API_BASE_URL}/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate flashcards: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Save flashcards
   */
  async saveFlashcards(data: {
    userId: string;
    noteId: string;
    flashcards: Array<{ question: string; answer: string }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/flashcards/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save flashcards: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Export to Markdown
   */
  async exportToMarkdown(noteId: string) {
    const response = await fetch(`${API_BASE_URL}/export/markdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export to Markdown: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Export to Anki
   */
  async exportToAnki(noteId: string) {
    const response = await fetch(`${API_BASE_URL}/export/anki`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export to Anki: ${response.statusText}`);
    }

    return response.json();
  },
};
