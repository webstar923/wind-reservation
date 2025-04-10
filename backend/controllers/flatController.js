const { Op } = require('sequelize'); // Import the Op operator from Sequelize
const Flat = require('../models/Flat'); // Your Flat model
// const Work = require('../models/Work');
// const Reservation = require('../models/Reservation');
const logger = require('../logger');
// Find Flat by partial match on the name

const getFlatAllData = async (req, res) => {  
  try {  
    const flatData = await Flat.findAll();    
    const dataValues = flatData.map(flat => flat.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const changeFlat = async (req, res) => { 
  try {    
    const {id,name,address} = req.body; // Extract name from the request body       
    if (!id) {
      return res.status(400).json({ message: 'flat_id is required' });
    }
    const flat = await Flat.findByPk(id);
    if (!flat) {
      return res.status(404).json({ message: 'flat not found' });
    }    
    if (flat.name !== name && flat.address !== address) {
      logger.logInfo('管理者によって'+flat.name+'物件の名前が'+name+"に住所が"+flat.address+"に変更されました。", req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    }else if(flat.name === name && flat.address !== address){
      logger.logInfo('管理者によって'+flat.name+'物件の住所が'+flat.address+"に変更されました。", req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    }
    flat.name = name; 
    flat.address = address; 
    await flat.save();
    return res.status(200).json(flat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const createFlat = async (req, res) => {  
  try {
    const { name,address} = req.body;
    
    if (!name || !address ) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    
    const newFlat = await Flat.create({name, address});
    logger.logInfo(name+'物件が新造創造されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    res.status(201).json(newFlat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const deleteFlat = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const flatToDelete = await Flat.findOne({ where: { id } });
    if (!flatToDelete) {
      return res.status(404).json({ message: '物件を見つかりません' });
    }
    await Flat.destroy({ where: { id } });
    logger.logInfo(flatToDelete.name+'物件が削除されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    res.status(200).json({ message: '物件が削除されました', flat: flatToDelete });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

module.exports = { 
    getFlatAllData, changeFlat, createFlat, deleteFlat
};
