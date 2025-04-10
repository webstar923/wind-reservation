const express = require('express');
const router = express.Router();
const { 
  getAllChats,
  createChat, 
  updateChat,
  deleteChat,
} = require('../controllers/chatController');

// Update routes to use controller functions
router.get('/', getAllChats);
router.post('/', createChat);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

module.exports = router;
    