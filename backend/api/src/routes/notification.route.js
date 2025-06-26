import express from 'express';
import auth from '../middlewares/auth.js';
import { getNotifications } from '../controllers/notification.controller.js';

const router = express.Router();

// GET /api/notification - récupère les notifications de l'utilisateur connecté
router.get('/', auth, getNotifications);

export default router;
