const express = require('express');
const noteRouter = express.Router();
const noteController = require('../controllers/noteController');

noteRouter
.route('/')
.get(noteController.getAllNotes)
.post(noteController.createNewNote)
.patch(noteController.updateNote)
.delete(noteController.deleteNote);

module.exports = noteRouter;