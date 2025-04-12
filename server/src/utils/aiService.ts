import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI with better error handling for the API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey
});

/**
 * Generate a summary from text content
 * @param content The text content to summarize
 * @returns A summarized version of the content
 */
export const generateSummary = async (content: string): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please check your environment variables.');
    }
    
    if (!content || content.trim().length === 0) {
      return "No content provided to summarize.";
    }

    // Limit content length to avoid token limits
    const trimmedContent = content.length > 10000 
      ? content.substring(0, 10000) + '...' 
      : content;

    const prompt = `You're a study assistant. Summarize the following text in bullet points for easy revision:
    
    ${trimmedContent}`;

    console.log('Sending request to OpenAI API for summary generation...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const summaryText = completion.choices[0]?.message?.content;
    
    if (!summaryText) {
      throw new Error('OpenAI returned empty summary response');
    }
    
    return summaryText;
  } catch (error: any) {
    console.error('Error generating summary:', error);
    
    // Provide more specific error messages
    if (error.response) {
      console.error('OpenAI API error status:', error.response.status);
      console.error('OpenAI API error data:', error.response.data);
      throw new Error(`OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate flashcards from text content
 * @param content The text content to generate flashcards from
 * @returns An array of question-answer pairs
 */
export const generateFlashcards = async (content: string): Promise<Array<{ question: string; answer: string }>> => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please check your environment variables.');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('No content provided to generate flashcards from.');
    }
    
    // Limit content length to avoid token limits
    const trimmedContent = content.length > 10000 
      ? content.substring(0, 10000) + '...' 
      : content;

    const prompt = `Based on the following text, generate a list of Q&A flashcards:
    
    ${trimmedContent}
    
    Return the output in JSON with format:
    [{ "question": "...", "answer": "..." }]`;

    console.log('Sending request to OpenAI API for flashcard generation...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI returned empty flashcard response');
    }
    
    console.log('Received response from OpenAI API, parsing JSON...');
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      
      // Ensure we have a cards array in the response
      if (Array.isArray(parsedResponse.cards)) {
        return parsedResponse.cards;
      } else if (Array.isArray(parsedResponse)) {
        return parsedResponse;
      } else {
        console.error('Unexpected response format:', responseContent);
        return [];
      }
    } catch (parseError: any) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseContent);
      throw new Error(`Failed to parse flashcard data: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    
    // Provide more specific error messages
    if (error.response) {
      console.error('OpenAI API error status:', error.response.status);
      console.error('OpenAI API error data:', error.response.data);
      throw new Error(`OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Failed to generate flashcards: ${error.message || 'Unknown error'}`);
  }
};

export default {
  generateSummary,
  generateFlashcards
};