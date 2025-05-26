import express from 'express';
import { summarizeDocument } from '../controllers/aiController.mjs';

const router = express.Router();

router.post('/summarize', summarizeDocument);

export default router;


