const express = require('express');
const router = express.Router();
const { 
  getAllCompanies,
  createCompany, 
  updateCompany,
  deleteCompany,
  getAvailableCompanies
} = require('../controllers/companyController');

// Update routes to use controller functions
router.get('/', getAllCompanies);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.post('/getAvailableCompanies', getAvailableCompanies);


module.exports = router;
    