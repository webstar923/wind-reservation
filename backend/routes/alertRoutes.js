const express = require('express');
const router = express.Router();
const { 
  getAlerts,
  getMessages,
  getAllAlerts,
  createAlert, 
  updateAlert,
  deleteAlert,
  markAsRead
} = require('../controllers/alertController');

// Update routes to use controller functions
router.get('/', getAlerts);
router.get('/getMessages', getMessages);
router.get('/all', getAllAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteAlert);

module.exports = router;
    