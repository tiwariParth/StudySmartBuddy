import express, { Router } from 'express';
import flashcardController from '../controllers/flashcard.controller';

const router: Router = express.Router();

// Define routes
router.post('/generate', flashcardController.generateFlashcardsForText);
router.get('/user/:userId', flashcardController.getUserFlashcards);
router.post('/save', flashcardController.saveFlashcards);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

export default router;