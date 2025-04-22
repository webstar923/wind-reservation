const express = require('express');
const { 
        getSettingData,setReservationNumPerDay,checkDate
     } = require('../controllers/settingController');

const router = express.Router();
router.get('/getSettingData',getSettingData);
router.post('/setReservationNumPerDay',setReservationNumPerDay);
router.post('/checkDate',checkDate);


module.exports = router;
