const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Chat = sequelize.define('Chat', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  options: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },},
  { 
    timestamps: false,
  });

module.exports = Chat;
