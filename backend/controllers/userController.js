const { Op } = require('sequelize'); // Import the Op operator from Sequelize
const User = require('../models/User');
const logger = require('../logger');



const getUserAllData = async (req, res) => {  
  try {  
    const userData = await User.findAll();    
    const dataValues = userData.map(user => user.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const changeUser = async (req, res) => {
  try {
    const {id,name,email,phoneNum,address,role,permissionStatus} = req.body; // Extract name from the request body   
    if (!id) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    const user = await User.findByPk(id);  
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
        user.name = name; 
        user.email = email; 
        user.phoneNum = phoneNum; 
        user.address = address; 
        user.role = role; 
        user.permissionStatus = permissionStatus === "許可" ? 1 : 0 ;
    
    await user.save();
    logger.logInfo(req.user.useremail+'管理者によって'+user.email+'ユーザーの情報が変更されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const createUser = async (req, res) => {
 
  try {
    const { name,password,email,phoneNum,address,role} = req.body;

    if ( !name||!email||!password||!phoneNum||!address||!role) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    
    const newUser = await User.create({ name,password,email,phoneNum,address,role});
    logger.logInfo(req.user.useremail+'管理者によって新しい'+newUser.email+'ユーザーが登録されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
   console.log(req.user);
    if (!id) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const UserToDelete = await User.findOne({ where: { id } });
    if (!UserToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.destroy({ where: { id } });
    logger.logInfo(req.user.useremail+'管理者によって'+UserToDelete.email+'ユーザーが削除されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    res.status(200).json({ message: 'Flat deleted successfully', User: UserToDelete });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getMemberData = async (req, res) => {  
  try {  
    const userData = await User.findAll({ where: { role: "member" } });
    const dataValues = userData.map(user => user.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
    getUserAllData, changeUser, createUser, deleteUser,getMemberData
  };
