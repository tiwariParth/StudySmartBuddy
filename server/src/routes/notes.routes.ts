import express, { Router } from 'express';
import multer from 'multer';
import * as notesController from '../controllers/notes.controller';

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept pdf files only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB max file size
  },
  fileFilter: fileFilter
});

const router: Router = express.Router();

// Define routes
router.post('/upload', upload.single('pdf'), notesController.uploadPdf);
router.post('/extract', notesController.extractText);
router.post('/generate-summary', notesController.generateNoteSummary);
router.get('/user/:userId', notesController.getUserNotes);
router.get('/:noteId', notesController.getNoteById);
router.post('/save', notesController.saveNote);
router.delete('/:id', notesController.deleteNote);
router.patch('/:id', notesController.updateNote);

export default router;