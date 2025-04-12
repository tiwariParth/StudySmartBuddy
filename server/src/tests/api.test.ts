import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

const API_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 'test-user-123';
// Define a storage for uploaded file path
let uploadedFilePath = '';

// Helper function to log results
const logResult = (name: string, success: boolean, data?: any, error?: any) => {
  console.log(`\n--- ${name} ---`);
  console.log(`Status: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  if (data) console.log('Response:', JSON.stringify(data, null, 2));
  if (error) console.log('Error:', error.message || error);
};

// Test API health
async function testHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    logResult('Health Check', response.status === 200, response.data);
    return response.data;
  } catch (error) {
    logResult('Health Check', false, undefined, error);
    return null;
  }
}

// Test PDF upload
async function testUploadPDF() {
  try {
    // Path to a sample PDF for testing - place a test PDF in this location
    const testPdfPath = path.join(__dirname, '../..', 'test-files', 'sample.pdf');
    
    // Check if test file exists
    if (!fs.existsSync(testPdfPath)) {
      console.log(`\n❌ Test PDF not found at ${testPdfPath}`);
      console.log('Please create a directory "test-files" in your server root with a sample PDF named "sample.pdf"');
      return null;
    }
    
    // Create form data with the PDF
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(testPdfPath));
    
    const response = await axios.post(
      `${API_URL}/notes/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    // Store the uploaded file path for later use
    if (response.data && response.data.file && response.data.file.path) {
      uploadedFilePath = response.data.file.path;
    }
    
    logResult('Upload PDF', response.status === 200, response.data);
    return response.data;
  } catch (error) {
    logResult('Upload PDF', false, undefined, error);
    return null;
  }
}

// Test extract text from PDF
async function testExtractText() {
  try {
    // Only proceed if we have an uploaded file
    if (!uploadedFilePath) {
      console.log('\n❌ Skipping text extraction - no uploaded file path available');
      return null;
    }
    
    const response = await axios.post(`${API_URL}/notes/extract`, {
      // Important: The server expects just the path, not with 'uploads/' prefix if it's already in the path
      filePath: uploadedFilePath
    });
    
    logResult('Extract Text From PDF', response.status === 200, response.data);
    return response.data.text;
  } catch (error) {
    logResult('Extract Text From PDF', false, undefined, error);
    return null;
  }
}

// Test note creation without PDF
async function testCreateNote() {
  try {
    const noteData = {
      userId: TEST_USER_ID,
      title: "Test Note " + new Date().toISOString(),
      rawText: "This is a test note created for API testing.",
      summary: "Test note summary."
    };
    
    const response = await axios.post(`${API_URL}/notes/save`, noteData);
    logResult('Create Note', response.status === 201, response.data);
    return response.data.note;
  } catch (error) {
    logResult('Create Note', false, undefined, error);
    return null;
  }
}

// Test retrieving notes for a user
async function testGetUserNotes() {
  try {
    const response = await axios.get(`${API_URL}/notes/user/${TEST_USER_ID}`);
    logResult('Get User Notes', response.status === 200, response.data);
    return response.data.notes;
  } catch (error) {
    logResult('Get User Notes', false, undefined, error);
    return [];
  }
}

// Test generating flashcards
async function testGenerateFlashcards() {
  try {
    const response = await axios.post(`${API_URL}/flashcards/generate`, {
      text: "The capital of France is Paris. The capital of Germany is Berlin."
    });
    logResult('Generate Flashcards', response.status === 200, response.data);
    return response.data.flashcards;
  } catch (error) {
    logResult('Generate Flashcards', false, undefined, error);
    return null;
  }
}

// Test saving flashcards to a note
async function testSaveFlashcards(noteId: string) {
  try {
    const flashcardsData = {
      userId: TEST_USER_ID,
      noteId: noteId,
      flashcards: [
        { question: "What is the capital of France?", answer: "Paris" },
        { question: "What is the capital of Germany?", answer: "Berlin" }
      ]
    };
    
    const response = await axios.post(`${API_URL}/flashcards/save`, flashcardsData);
    logResult('Save Flashcards', response.status === 201, response.data);
    return response.data.flashcards;
  } catch (error) {
    logResult('Save Flashcards', false, undefined, error);
    return null;
  }
}

// Run tests sequentially
async function runTests() {
  console.log('🧪 Starting API tests...');
  
  // Basic health check
  await testHealth();
  
  // Test PDF upload and text extraction
  const uploadResult = await testUploadPDF();
  if (uploadResult && uploadResult.success) {
    const extractedText = await testExtractText();
    
    // If we successfully extracted text, we can use it to create a note
    if (extractedText) {
      try {
        const noteData = {
          userId: TEST_USER_ID,
          title: "Note from PDF " + new Date().toISOString(),
          rawText: extractedText,
          summary: "This is a summary of the extracted PDF content.",
          pdfUrl: uploadedFilePath
        };
        
        const response = await axios.post(`${API_URL}/notes/save`, noteData);
        logResult('Create Note from PDF', response.status === 201, response.data);
        
        // Test flashcards with this note
        if (response.data && response.data.note && response.data.note._id) {
          await testSaveFlashcards(response.data.note._id);
        }
      } catch (error) {
        logResult('Create Note from PDF', false, undefined, error);
      }
    }
  }
  
  // Create a regular note
  const note = await testCreateNote();
  
  // Get user notes
  const notes = await testGetUserNotes();
  
  // Generate flashcards
  const flashcards = await testGenerateFlashcards();
  
  // If we have a note and flashcards, we could test saving flashcards to the note
  if (note && flashcards && note._id) {
    await testSaveFlashcards(note._id);
    console.log('\nAll core functionality tests completed.');
  }
}

// Helper function to create test directories if they don't exist
function setupTestEnvironment() {
  // Create test-files directory if it doesn't exist
  const testFilesDir = path.join(__dirname, '../..', 'test-files');
  if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
    console.log(`Created test directory: ${testFilesDir}`);
    console.log('Please add a sample.pdf file to this directory for PDF upload testing.');
  }
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
  }
  
  // Ensure exports directory exists
  const exportsDir = path.join(__dirname, '../..', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
    console.log(`Created exports directory: ${exportsDir}`);
  }
}

// Setup environment before running tests
setupTestEnvironment();

// Run the tests
runTests();
