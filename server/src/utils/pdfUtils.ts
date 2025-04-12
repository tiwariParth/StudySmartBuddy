import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF content
    const data = await pdf(dataBuffer);
    
    // Return the text content
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export default {
  extractTextFromPDF
};