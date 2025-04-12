# StudySmartBuddy API Testing Guide with Postman

## Setting Up Postman Collection

1. Open Postman
2. Create a new collection named "StudySmartBuddy API"
3. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `user_id`: `test-user-123`

## Testing Endpoints

### 1. Health Check

- **Request**:
  - Method: `GET`
  - URL: `{{base_url}}/health`
  - Headers: None
  - Body: None

- **Expected Response**: 
  ```json
  {
    "status": "ok",
    "message": "Smart Notes API is running!"
  }
  ```

### 2. Upload PDF

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/notes/upload`
  - Headers: None
  - Body: Form-data
    - Key: `pdf` (type: File)
    - Value: Select your PDF file

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "PDF uploaded successfully",
    "file": {
      "fieldname": "pdf",
      "originalname": "your-file.pdf",
      "encoding": "7bit",
      "mimetype": "application/pdf",
      "destination": "./uploads/",
      "filename": "timestamp-your-file.pdf",
      "path": "uploads/timestamp-your-file.pdf",
      "size": 12345
    }
  }
  ```

- **Test Script** (add to Tests tab):
  ```javascript
  // Save file path for later use
  const jsonData = pm.response.json();
  if (pm.response.code === 200 && jsonData.success && jsonData.file && jsonData.file.path) {
    pm.environment.set("uploaded_file_path", jsonData.file.path);
    console.log("File path saved:", jsonData.file.path);
  } else {
    console.error("Could not save file path. Response structure:", JSON.stringify(jsonData));
  }
  ```

### 3. Extract Text from PDF

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/notes/extract`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "filePath": "{{uploaded_file_path}}"
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Text extracted successfully",
    "text": "Extracted text content..."
  }
  ```

- **Test Script**:
  ```javascript
  // Save extracted text for later use
  if (pm.response.code === 200 && pm.response.json().success) {
    pm.environment.set("extracted_text", pm.response.json().text.substring(0, 500)); // Save first 500 chars
  }
  ```

### 4. Generate Summary

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/notes/generate-summary`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "text": "{{extracted_text}}",
      "title": "Test Summary"
    }
    ```

- **Note**: Double-check the URL when making this request! The correct URL is `{{base_url}}/notes/generate-summary` (not `/ap/notes/generate-summary`).

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Summary generated successfully",
    "summary": "...",
    "title": "Test Summary",
    "rawText": "..."
  }
  ```

### 5. Save Note

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/notes/save`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "userId": "{{user_id}}",
      "title": "Test Note",
      "rawText": "{{extracted_text}}",
      "summary": "This is a test summary.",
      "pdfUrl": "{{uploaded_file_path}}"
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Note saved successfully",
    "note": {
      "_id": "note_id_here",
      "userId": "test-user-123",
      "title": "Test Note",
      "summary": "This is a test summary.",
      "flashcards": []
    }
  }
  ```

- **Test Script**:
  ```javascript
  if (pm.response.code === 201 && pm.response.json().success) {
    pm.environment.set("note_id", pm.response.json().note._id);
  }
  ```

### 6. Get User Notes

- **Request**:
  - Method: `GET`
  - URL: `{{base_url}}/notes/user/{{user_id}}`
  - Headers: None
  - Body: None

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Notes retrieved successfully",
    "notes": [
      {
        "_id": "note_id_here",
        "userId": "test-user-123",
        "title": "Test Note",
        "summary": "This is a test summary.",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### 7. Get Note by ID

- **Request**:
  - Method: `GET`
  - URL: `{{base_url}}/notes/{{note_id}}`
  - Headers: None
  - Body: None

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Note retrieved successfully",
    "note": {
      "_id": "note_id_here",
      "userId": "test-user-123",
      "title": "Test Note",
      "rawText": "...",
      "summary": "This is a test summary.",
      "flashcards": []
    }
  }
  ```

### 8. Generate Flashcards

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/flashcards/generate`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "text": "The capital of France is Paris. The capital of Germany is Berlin."
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Flashcards generated successfully",
    "flashcards": [
      {
        "question": "What is the capital of France?",
        "answer": "Paris"
      },
      {
        "question": "What is the capital of Germany?",
        "answer": "Berlin"
      }
    ]
  }
  ```

### 9. Save Flashcards

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/flashcards/save`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "userId": "{{user_id}}",
      "noteId": "{{note_id}}",
      "flashcards": [
        {
          "question": "What is the capital of France?",
          "answer": "Paris"
        },
        {
          "question": "What is the capital of Germany?",
          "answer": "Berlin"
        }
      ]
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Flashcards saved successfully",
    "flashcards": [
      {
        "_id": "flashcard_id_1",
        "userId": "test-user-123",
        "noteId": "note_id_here",
        "question": "What is the capital of France?",
        "answer": "Paris"
      },
      {
        "_id": "flashcard_id_2",
        "userId": "test-user-123",
        "noteId": "note_id_here",
        "question": "What is the capital of Germany?",
        "answer": "Berlin"
      }
    ]
  }
  ```

- **Test Script**:
  ```javascript
  if (pm.response.code === 201 && pm.response.json().success && pm.response.json().flashcards.length > 0) {
    pm.environment.set("flashcard_id", pm.response.json().flashcards[0]._id);
  }
  ```

### 10. Get User Flashcards

- **Request**:
  - Method: `GET`
  - URL: `{{base_url}}/flashcards/user/{{user_id}}`
  - Headers: None
  - Body: None

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Flashcards retrieved successfully",
    "flashcards": [
      {
        "_id": "flashcard_id_here",
        "userId": "test-user-123",
        "noteId": {
          "_id": "note_id_here",
          "title": "Test Note"
        },
        "question": "What is the capital of France?",
        "answer": "Paris"
      }
    ]
  }
  ```

### 11. Update Flashcard

- **Request**:
  - Method: `PUT`
  - URL: `{{base_url}}/flashcards/{{flashcard_id}}`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "question": "What is the capital of France? (Updated)",
      "answer": "Paris is the capital of France"
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Flashcard updated successfully",
    "flashcard": {
      "_id": "flashcard_id_here",
      "userId": "test-user-123",
      "noteId": "note_id_here",
      "question": "What is the capital of France? (Updated)",
      "answer": "Paris is the capital of France"
    }
  }
  ```

### 12. Export to Markdown

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/export/markdown`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "noteId": "{{note_id}}"
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Content exported to Markdown successfully",
    "filename": "Test_Note_2023-01-01T00-00-00.000Z.md",
    "filePath": "/exports/Test_Note_2023-01-01T00-00-00.000Z.md",
    "markdown": "# Test Note\n\n## Summary\n\nThis is a test summary.\n\n## Flashcards\n\n### Card 1\n\n**Q:** What is the capital of France? (Updated)\n\n**A:** Paris is the capital of France\n\n"
  }
  ```

### 13. Export to Anki

- **Request**:
  - Method: `POST`
  - URL: `{{base_url}}/export/anki`
  - Headers: `Content-Type: application/json`
  - Body (raw JSON):
    ```json
    {
      "noteId": "{{note_id}}"
    }
    ```

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Content exported to Anki-compatible format successfully",
    "filename": "Test_Note_2023-01-01T00-00-00.000Z.csv",
    "filePath": "/exports/Test_Note_2023-01-01T00-00-00.000Z.csv",
    "csvContent": "\"What is the capital of France? (Updated)\",\"Paris is the capital of France\",\"Test Note\"\n"
  }
  ```

### 14. Delete Flashcard

- **Request**:
  - Method: `DELETE`
  - URL: `{{base_url}}/flashcards/{{flashcard_id}}`
  - Headers: None
  - Body: None

- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Flashcard deleted successfully"
  }
  ```

## Troubleshooting Common Issues

### 1. File Not Found Error
If you see "File not found" when extracting text, make sure:
- The file was uploaded successfully
- You're using the exact path returned from the upload response
- The path doesn't have extra "uploads/" prefix if it's already in the path

### 2. MongoDB Connection Issues
If you see database connection errors:
- Check that MongoDB is running
- Verify the connection string in your `.env` file

### 3. OpenAI API Issues
If summary or flashcard generation fails:
- Check your OpenAI API key is valid and has sufficient credits
- Look for rate limiting errors in the server logs

### 4. PDF Upload Problems
If PDF upload fails:
- Ensure the uploads directory exists and has write permissions
- Check that the PDF file is not corrupted
- Verify that the file size is under 10MB (your limit)

## Testing Flow Tips

For most efficient testing, follow this sequence:
1. Health Check
2. Upload PDF
3. Extract Text
4. Generate Summary
5. Save Note
6. Generate Flashcards
7. Save Flashcards
8. Export to Markdown/Anki

This allows you to leverage Postman environment variables to pass data between requests.
