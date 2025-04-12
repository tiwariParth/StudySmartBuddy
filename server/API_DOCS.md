# StudySmartBuddy API Documentation

## Base URL
- Local Development: `http://localhost:5000/api`

## Authentication
Currently, API uses simple `userId` param without actual authentication.

## API Endpoints

### Health Check
- **GET** `/health` - Check if API is running

### Notes API
- **POST** `/notes/upload` - Upload PDF file
  - **Body**: Form-data with key 'pdf' and file value
- **POST** `/notes/extract` - Extract text from PDF
  - **Body**: `{"filePath": "uploads/file.pdf"}`
- **POST** `/notes/generate-summary` - Generate summary from text
  - **Body**: `{"text": "content", "title": "optional title"}`
- **POST** `/notes/save` - Save a note
  - **Body**: `{"userId": "id", "title": "title", "rawText": "text", "summary": "summary"}`
- **GET** `/notes/user/:userId` - Get all notes for a user
- **GET** `/notes/:noteId` - Get specific note by ID

### Flashcards API
- **POST** `/flashcards/generate` - Generate flashcards from text
  - **Body**: `{"text": "content"}`
- **POST** `/flashcards/save` - Save flashcards for a note
  - **Body**: `{"userId": "id", "noteId": "id", "flashcards": [{"question": "q", "answer": "a"}]}`
- **GET** `/flashcards/user/:userId` - Get all flashcards for a user
- **PUT** `/flashcards/:id` - Update a flashcard
  - **Body**: `{"question": "updated q", "answer": "updated a"}`
- **DELETE** `/flashcards/:id` - Delete a flashcard

### Export API
- **POST** `/export/markdown` - Export note to Markdown
  - **Body**: `{"noteId": "id"}`
- **POST** `/export/anki` - Export flashcards to Anki CSV format
  - **Body**: `{"noteId": "id"}`
