
const Setting = require('../models/Setting');
const Reservation = require('../models/Reservation');

const getSettingData = async (req, res) => {
  try {
    const settingData = await Setting.findAll();
    const dataValues = settingData.map(data => data.dataValues);
    res.status(200).json(dataValues);
   

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const setReservationNumPerDay = async (req, res) => {
  try {
    const { val } = req.body;

    const settingData = await Setting.findOne({ where: { id: 1 } });
    if (!settingData) {
      return res.status(404).json({ message: '設定が見つかりませんでした' });
    }

    settingData.T_number = val;
    await settingData.save();

    res.status(200).json(settingData); // or settingData.dataValues
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const checkDate = async (req, res) => {
  try {
    const { date } = req.body;
    const selectedDate = new Date(date);
    const settingData = await Setting.findOne({ where: { id: 1 } });  
    const reservationCount = await Reservation.count({ where: {start_time: selectedDate } });
    if (settingData.T_number>reservationCount) {
      res.status(200).json({check:"available",status:true}); // or settingData.dataValues
    } else{
      res.status(200).json({check:"nonavailable",status:false}); // or settingData.dataValues
    }  

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
module.exports = { 
  getSettingData,setReservationNumPerDay,checkDate
  
};
