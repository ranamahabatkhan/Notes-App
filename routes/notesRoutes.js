const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.get('/', isAuthenticated, notesController.listNotes);
router.post('/', isAuthenticated, notesController.createNote);
router.get('/edit/:id', isAuthenticated, notesController.editNote);
router.post('/edit/:id', isAuthenticated, notesController.updateNote);
router.post('/delete/:id', isAuthenticated, notesController.deleteNote);

module.exports = router;