import express from 'express';
import { createLead, getLeads, getLead, updateLead, deleteLead } from '../controllers/leadController.mjs';
import protect from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect); 

router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;