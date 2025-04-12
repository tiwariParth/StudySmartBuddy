import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a summary from text content
 * @param content The text content to summarize
 * @returns A summarized version of the content
 */
export const generateSummary = async (content: string): Promise<string> => {
  try {
    const prompt = `You're a study assistant. Summarize the following text in bullet points for easy revision:
    
    ${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "Could not generate summary.";
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Generate flashcards from text content
 * @param content The text content to generate flashcards from
 * @returns An array of question-answer pairs
 */
export const generateFlashcards = async (content: string): Promise<Array<{ question: string; answer: string }>> => {
  try {
    const prompt = `Based on the following text, generate a list of Q&A flashcards:
    
    ${content}
    
    Return the output in JSON with format:
    [{ "question": "...", "answer": "..." }]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content || "[]";
    const parsedResponse = JSON.parse(responseContent);
    
    // Ensure we have a cards array in the response
    return Array.isArray(parsedResponse.cards) 
      ? parsedResponse.cards 
      : (Array.isArray(parsedResponse) ? parsedResponse : []);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
};

export default {
  generateSummary,
  generateFlashcards
};