const { Op } = require('sequelize'); 
const Work = require('../models/Work');
const logger = require('../logger');


const getWorkAllData = async (req, res) => {  
  try {  
    const workData = await Work.findAll();    
    const dataValues = workData.map(work => work.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const changeWork = async (req, res) => {
  try {
    const {id, work_name, flat_name, room_num, start_time, end_time} = req.body; // Extract name from the request body   
    
    if (!id) {
      return res.status(400).json({ message: 'work_id is required' });
    }

    const changeWork = await Work.findByPk(id);
    if (!changeWork) {
      return res.status(404).json({ message: 'Work not found' });
    }
      changeWork.work_name= work_name; 
      changeWork.flat_name= flat_name; 
      changeWork.room_num= room_num; 
      changeWork.start_time= start_time; 
      changeWork.end_time= end_time; 
    
    await changeWork.save();
    logger.logInfo('管理者によって'+changeWork.work_name+'案件が変更されました。', req.id, req.originalUrl, req.method, res.statusCode,"" ,req.ip);
    return res.status(200).json(changeWork);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const createWork = async (req, res) => {  
 
  try {
    const { work_name,flat_name, room_num, start_time, end_time} = req.body;    
    if ( !work_name||!flat_name||!room_num||!start_time||!end_time) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }    
    const newWork = await Work.create({work_name,flat_name, room_num, start_time, end_time});
    logger.logInfo('管理者によって'+newWork.work_name+'案件が登録されました。', req.id, req.originalUrl, req.method, res.statusCode,"", req.ip);
    res.status(201).json(newWork);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteWork = async (req, res) => {
  try {
    const { id } = req.body;
   
    if (!id) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const WorkToDelete = await Work.findOne({ where: { id } });
    if (!WorkToDelete) {
      return res.status(404).json({ message: 'Flat not found' });
    }
    await Work.destroy({ where: { id } });
    logger.logInfo('管理者によって'+WorkToDelete.work_name+'案件が削除されました。', req.id, req.originalUrl, req.method, res.statusCode, "", req.ip);

    res.status(201).json({Work: WorkToDelete});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
    getWorkAllData, changeWork, createWork, deleteWork
};
