
const Setting = require('../models/Setting');
const Reservation = require('../models/Reservation');
const Company = require("../models/Company");
const { Op } = require("sequelize");

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
    const { date, prefecture} = req.body;
    const selectedDate = new Date(date);

    // Get day of week in Japanese short form (月, 火, etc.)
    const weekday = selectedDate.toLocaleDateString("ja-JP", { weekday: "short" });

    const companies = await Company.findAll({
      where: { available_prefecture: prefecture }
    });

    let totalAvailableReservations = 0;

    for (const company of companies) {
      const rvNums = company.available_rv_num.split(",");
      for (const entry of rvNums) {
        const [day, count] = entry.split(":");
        if (day === weekday) {
          totalAvailableReservations += parseInt(count);
          break;
        }
      }
    }
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const reservationCount = await Reservation.count({
      where: {
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        },
        prefecture: prefecture
      }
    });
    if (totalAvailableReservations > reservationCount) {
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
