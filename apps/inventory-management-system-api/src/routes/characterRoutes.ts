import express, { Router } from 'express';
import * as characterController from '../controllers/characterController';

// Define the type for the Router explicitly
const router: Router = express.Router();

// Set routes here
router.get('/', characterController.getCharacters);
router.post('/', characterController.addCharacter);

// Export the router to be used in main.ts
export default router;
