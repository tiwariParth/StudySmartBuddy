import fs from 'fs';
// Change the import syntax for pdf-parse to avoid TypeScript declaration issues
const pdf = require('pdf-parse');
import path from 'path';

/**
 * Extract text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`Attempting to read PDF file: ${filePath}`);
    
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    if (!dataBuffer || dataBuffer.length === 0) {
      console.error('PDF file is empty or could not be read');
      throw new Error('PDF file is empty or could not be read');
    }
    
    console.log(`Successfully read PDF file, size: ${dataBuffer.length} bytes`);
    
    // Parse the PDF content with options
    const data = await pdf(dataBuffer, {
      // Adding some options to handle potential parsing issues
      max: 0, // 0 = unlimited pages
      version: 'v2.0.550'
    });
    
    console.log(`PDF parsed successfully. Text length: ${data.text.length} characters`);
    
    if (!data.text || data.text.trim().length === 0) {
      console.warn('Warning: Extracted text is empty');
      return 'No text could be extracted from the PDF. The file might be scanned images or protected.';
    }
    
    // Return the text content
    return data.text;
  } catch (error: any) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
  }
};

export default {
  extractTextFromPDF
};