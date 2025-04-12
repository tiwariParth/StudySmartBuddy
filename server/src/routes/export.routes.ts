import express, { Router } from 'express';
import * as exportController from '../controllers/export.controller';

const router: Router = express.Router();

// Define routes
router.post('/markdown', exportController.exportToMarkdown);
router.post('/anki', exportController.exportToAnki);

export default router;